import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { Club, ClubMember } from '@/shared/api/types'

export const clubHandlers = [
  // GET /clubs — Spring: 가입(APPROVED 부원) 동아리만 + 선택 필터
  http.get(API('/clubs'), async ({ request }) => {
    await delay(150)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const url = new URL(request.url)
    const schoolId = url.searchParams.get('schoolId')
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const joinedIds = new Set(
      db.clubMembers
        .filter((m) => m.userId === me.id && m.status === 'APPROVED')
        .map((m) => m.clubId),
    )
    let list = db.clubs.filter((c) => joinedIds.has(c.id))
    if (schoolId) list = list.filter((c) => c.schoolId === Number(schoolId))
    if (category) list = list.filter((c) => c.category === category)
    if (status) list = list.filter((c) => c.status === status)
    return HttpResponse.json(list)
  }),

  // GET /clubs/partner-options — Spring ClubService.getPartnerOptions 동일
  http.get(API('/clubs/partner-options'), async ({ request }) => {
    await delay(120)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const url = new URL(request.url)
    const hostClubId = Number(url.searchParams.get('hostClubId'))
    if (!hostClubId)
      return HttpResponse.json({ message: 'hostClubId가 필요합니다' }, { status: 400 })
    const host = db.clubs.find((c) => c.id === hostClubId)
    if (!host) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    if (host.status !== 'APPROVED')
      return HttpResponse.json({ message: '승인된 동아리만 파트너 후보를 조회할 수 있습니다.' }, { status: 400 })
    if (host.presidentUserId !== me.id)
      return HttpResponse.json({ message: '주최 동아리 회장만 파트너 후보를 조회할 수 있습니다.' }, { status: 403 })
    const list = db.clubs.filter((c) => c.status === 'APPROVED' && c.id !== hostClubId)
    return HttpResponse.json(list)
  }),

  // POST /clubs
  http.post(API('/clubs'), async ({ request }) => {
    await delay(200)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const body = (await request.json()) as Partial<Club>
    const club: Club = {
      id: db.nextId.club++,
      schoolId: body.schoolId!,
      presidentUserId: me.id!,
      name: body.name ?? '',
      category: body.category,
      description: body.description,
      logoImage: body.logoImage,
      evidenceUrl: body.evidenceUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    db.clubs.push(club)
    return HttpResponse.json(club, { status: 201 })
  }),

  // GET /clubs/{id}
  http.get(API('/clubs/:id'), async ({ params }) => {
    await delay(100)
    const club = db.clubs.find((c) => c.id === Number(params.id))
    if (!club) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(club)
  }),

  // PATCH /clubs/{id}
  http.patch(API('/clubs/:id'), async ({ params, request }) => {
    await delay(150)
    const club = db.clubs.find((c) => c.id === Number(params.id))
    if (!club) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const patch = (await request.json()) as Partial<Club>
    Object.assign(club, patch)
    return HttpResponse.json(club)
  }),

  // POST /clubs/{id}/approve (Railway CUU 동일)
  http.post(API('/clubs/:id/approve'), async ({ params, request }) => {
    await delay(150)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (me?.role !== 'SUPER_ADMIN')
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    const club = db.clubs.find((c) => c.id === Number(params.id))
    if (!club) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    club.status = 'APPROVED'
    club.approvedByUserId = me.id
    club.approvedAt = new Date().toISOString()
    club.inviteCode = `MOCK-${club.id}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    return HttpResponse.json(club)
  }),

  // POST /clubs/{id}/reject
  http.post(API('/clubs/:id/reject'), async ({ params, request }) => {
    await delay(150)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (me?.role !== 'SUPER_ADMIN')
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    const club = db.clubs.find((c) => c.id === Number(params.id))
    if (!club) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const { rejectReason } = (await request.json()) as { rejectReason: string }
    club.status = 'REJECTED'
    club.rejectReason = rejectReason
    return HttpResponse.json(club)
  }),

  // POST /clubs/join
  http.post(API('/clubs/join'), async ({ request }) => {
    await delay(150)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const { inviteCode } = (await request.json()) as { inviteCode: string }
    const club = db.clubs.find((c) => c.inviteCode === inviteCode && c.status === 'APPROVED')
    if (!club) return HttpResponse.json({ message: '유효하지 않은 초대코드' }, { status: 400 })
    const existing = db.clubMembers.find((m) => m.clubId === club.id && m.userId === me.id)
    if (existing) return HttpResponse.json(existing)
    const member: ClubMember = {
      id: db.nextId.clubMember++,
      clubId: club.id,
      userId: me.id!,
      memberRole: 'MEMBER',
      status: 'APPROVED',
      joinedAt: new Date().toISOString(),
    }
    db.clubMembers.push(member)
    return HttpResponse.json(member)
  }),

  // GET /clubs/{clubId}/members
  http.get(API('/clubs/:clubId/members'), async ({ params }) => {
    await delay(100)
    const list = db.clubMembers.filter((m) => m.clubId === Number(params.clubId))
    return HttpResponse.json(list)
  }),

  // DELETE /clubs/{clubId}/members/{userId}
  http.delete(API('/clubs/:clubId/members/:userId'), async ({ params }) => {
    await delay(120)
    const idx = db.clubMembers.findIndex(
      (m) => m.clubId === Number(params.clubId) && m.userId === Number(params.userId),
    )
    if (idx >= 0) db.clubMembers[idx].status = 'LEFT'
    return new HttpResponse(null, { status: 204 })
  }),
]
