import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { Club, ClubMember } from '@/shared/api/types'

export const clubHandlers = [
  // GET /clubs
  http.get(API('/clubs'), async ({ request }) => {
    await delay(150)
    const url = new URL(request.url)
    const schoolId = url.searchParams.get('schoolId')
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    let list = [...db.clubs]
    if (schoolId) list = list.filter((c) => c.schoolId === Number(schoolId))
    if (category) list = list.filter((c) => c.category === category)
    if (status) list = list.filter((c) => c.status === status)
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

  // PATCH /clubs/{id}/approve
  http.patch(API('/clubs/:id/approve'), async ({ params, request }) => {
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

  // PATCH /clubs/{id}/reject
  http.patch(API('/clubs/:id/reject'), async ({ params, request }) => {
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
