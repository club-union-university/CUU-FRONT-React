import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { Event } from '@/shared/api/types'

export const eventHandlers = [
  // GET /events
  http.get(API('/events'), async ({ request }) => {
    await delay(150)
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const hostClubId = url.searchParams.get('hostClubId')
    const category = url.searchParams.get('category')
    let list = [...db.events]
    if (type) list = list.filter((e) => e.type === type)
    if (status) list = list.filter((e) => e.status === status)
    if (hostClubId) list = list.filter((e) => e.hostClubId === Number(hostClubId))
    if (category) list = list.filter((e) => e.category === category)
    return HttpResponse.json(list)
  }),

  // POST /events
  http.post(API('/events'), async ({ request }) => {
    await delay(200)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const body = (await request.json()) as Partial<Event>
    const event: Event = {
      id: db.nextId.event++,
      type: body.type!,
      hostClubId: body.hostClubId!,
      partnerClubId: body.partnerClubId,
      title: body.title ?? '',
      category: body.category,
      description: body.description,
      format: body.format,
      proposalMessage: body.proposalMessage,
      status: 'DRAFT',
      hostApproved: false,
      partnerApproved: body.type === 'INTRA_CLUB' ? undefined : false,
      createdByUserId: me.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.events.push(event)
    return HttpResponse.json(event, { status: 201 })
  }),

  // GET /events/{id}
  http.get(API('/events/:id'), async ({ params }) => {
    await delay(100)
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(event)
  }),

  // PATCH /events/{id}
  http.patch(API('/events/:id'), async ({ params, request }) => {
    await delay(150)
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const patch = (await request.json()) as Partial<Event>
    Object.assign(event, patch, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(event)
  }),

  // DELETE /events/{id}
  http.delete(API('/events/:id'), async ({ params }) => {
    await delay(120)
    const idx = db.events.findIndex((e) => e.id === Number(params.id))
    if (idx >= 0) db.events.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /events/{id}/ai/step1
  http.post(API('/events/:id/ai/step1'), async ({ params }) => {
    await delay(2200) // step1 응답 지연 시뮬레이션
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const refined = refineByCategory(event)
    // step1 결과를 event에 캐시도 함
    event.step1Data = refined
    return HttpResponse.json(refined)
  }),

  // POST /events/{id}/ai/step2
  http.post(API('/events/:id/ai/step2'), async ({ params }) => {
    await delay(3500) // step2(외부 조회 가정) 지연 시뮬레이션
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const result = step2Recommendation(event)
    event.step2Data = result
    return HttpResponse.json(result)
  }),

  // POST /events/{id}/submit
  http.post(API('/events/:id/submit'), async ({ params }) => {
    await delay(120)
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    event.status = 'PARTNER_REVIEW'
    event.hostApproved = true
    return HttpResponse.json(event)
  }),

  // PATCH /events/{id}/approve
  http.patch(API('/events/:id/approve'), async ({ params }) => {
    await delay(120)
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    if (event.type === 'INTER_CLUB') event.partnerApproved = true
    event.status = 'APPROVED'
    event.partnerRespondedAt = new Date().toISOString()
    return HttpResponse.json(event)
  }),

  // PATCH /events/{id}/reject
  http.patch(API('/events/:id/reject'), async ({ params, request }) => {
    await delay(120)
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const { rejectReason } = (await request.json()) as { rejectReason: string }
    event.status = 'REJECTED'
    event.rejectReason = rejectReason
    event.partnerRespondedAt = new Date().toISOString()
    return HttpResponse.json(event)
  }),

  // PATCH /events/{id}/recruiting
  http.patch(API('/events/:id/recruiting'), async ({ params }) => {
    await delay(100)
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    event.status = 'RECRUITING'
    return HttpResponse.json(event)
  }),

  // PATCH /events/{id}/close
  http.patch(API('/events/:id/close'), async ({ params }) => {
    await delay(100)
    const event = db.events.find((e) => e.id === Number(params.id))
    if (!event) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    event.status = 'CLOSED'
    return new HttpResponse(null, { status: 200 })
  }),
]

// ============================================================
// 초안 시뮬레이션 — proposalMessage 키워드로 분기
// ============================================================

function refineByCategory(event: Event) {
  const text = `${event.title} ${event.proposalMessage ?? ''}`
  if (/해커톤|hackathon/i.test(text)) {
    return {
      title: event.title?.includes('해커톤') ? event.title : `${event.title} 해커톤`,
      category: 'HACKATHON',
      description: `${event.title} — 24시간 무박으로 진행합니다.\n백엔드/프론트엔드/디자이너/기획자 모두 환영합니다.\n팀당 4명을 권장하며 현장에서 팀빌딩이 가능합니다.`,
      format: '무박 24시간',
    }
  }
  if (/워크샵|workshop/i.test(text)) {
    return {
      title: event.title,
      category: 'WORKSHOP',
      description: `${event.title} 워크샵.\n실습 위주로 진행하며 사전 자료를 미리 공유합니다.`,
      format: '8시간',
    }
  }
  if (/스터디|study/i.test(text)) {
    return {
      title: event.title,
      category: 'STUDY',
      description: `${event.title} 스터디.\n주 1회 정기 모임으로 진행합니다.`,
      format: '주 1회 (방학 기간 8주)',
    }
  }
  if (/페스티벌|festival/i.test(text)) {
    return {
      title: event.title,
      category: 'FESTIVAL',
      description: `${event.title} 페스티벌.\n부스 운영과 발표가 함께 진행됩니다.`,
      format: '하루 (10시간)',
    }
  }
  return {
    title: event.title,
    category: 'MEETUP',
    description: `${event.title} 모임.\n네트워킹과 정기 발표 중심으로 진행합니다.`,
    format: '4시간',
  }
}

function step2Recommendation(event: Event) {
  const host = db.clubs.find((c) => c.id === event.hostClubId)
  const hostSchool = db.schools.find((s) => s.id === host?.schoolId)
  const isInter = event.type === 'INTER_CLUB'
  const partner = isInter ? db.clubs.find((c) => c.id === event.partnerClubId) : undefined
  const partnerSchool = partner ? db.schools.find((s) => s.id === partner.schoolId) : undefined

  // 연합이면 두 학교 중간점, 교내면 호스트 학교 시설
  const placeCandidates = isInter
    ? [
        {
          name: '인하대학교 60주년기념관',
          address: '인천 미추홀구 인하로 100',
          lat: 37.4496,
          lng: 126.6533,
          placeId: 'mock-place-inha',
          rationale: '두 학교 중간점 + 좌석 200석 이상',
        },
        {
          name: '송도컨벤시아',
          address: '인천 연수구 센트럴로 123',
          lat: 37.3856,
          lng: 126.6406,
          placeId: 'mock-place-songdo',
          rationale: '대규모 행사 가능, 송도역 도보 5분',
        },
        {
          name: '아주대학교 율곡관',
          address: '경기 수원시 영통구 월드컵로 206',
          lat: 37.2828,
          lng: 127.0436,
          placeId: 'mock-place-ajou',
          rationale: '강의실 4개 + 전산 인프라',
        },
      ]
    : [
        {
          name: hostSchool?.name + ' 본관 강의실',
          address: '교내',
          lat: hostSchool?.lat ?? 37.3,
          lng: hostSchool?.lng ?? 126.8,
          placeId: 'mock-place-host',
          rationale: '교내 시설 우선 추천',
        },
      ]

  const recommended = placeCandidates[0]

  return {
    locationName: recommended.name,
    locationAddress: recommended.address,
    locationLat: recommended.lat,
    locationLng: recommended.lng,
    placeId: recommended.placeId,
    placeCandidates,
    boardCategories: ['NOTICE', 'SCHEDULE', 'TEAM_BUILDING', 'QNA', 'RESOURCE'],
    noticePost: {
      title: `[공지] ${event.title} 안내`,
      content: [
        `안녕하세요. ${event.title} 공지입니다.`,
        ``,
        `- 일정: 모집 마감 후 확정`,
        `- 장소: ${recommended.name}`,
        `- 모집: ${event.maxParticipants ?? '미정'}명`,
        ``,
        `참여 신청은 본 게시판에서 가능합니다.`,
        `팀빌딩은 #팀빌딩 카테고리에 부탁드립니다.`,
      ].join('\n'),
    },
    schools: {
      host: hostSchool?.name,
      partner: partnerSchool?.name,
    },
  }
}
