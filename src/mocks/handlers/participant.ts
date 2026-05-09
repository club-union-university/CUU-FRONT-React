import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { EventParticipant } from '@/shared/api/types'

export const participantHandlers = [
  // GET /events/{eventId}/participants
  http.get(API('/events/:eventId/participants'), async ({ params, request }) => {
    await delay(120)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    let list = db.participants.filter((p) => p.eventId === Number(params.eventId))
    if (status) list = list.filter((p) => p.status === status)
    return HttpResponse.json(list)
  }),

  // POST /events/{eventId}/participants
  http.post(API('/events/:eventId/participants'), async ({ params, request }) => {
    await delay(150)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const eventId = Number(params.eventId)
    const existing = db.participants.find((p) => p.eventId === eventId && p.userId === me.id)
    if (existing) return HttpResponse.json(existing)
    const participant: EventParticipant = {
      id: db.nextId.participant++,
      eventId,
      userId: me.id!,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    }
    db.participants.push(participant)
    return HttpResponse.json(participant, { status: 201 })
  }),

  // PATCH /events/{eventId}/participants/{participantId}/approve
  http.patch(API('/events/:eventId/participants/:participantId/approve'), async ({ params }) => {
    await delay(120)
    const p = db.participants.find((p) => p.id === Number(params.participantId))
    if (!p) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    p.status = 'APPROVED'
    p.respondedAt = new Date().toISOString()
    return new HttpResponse(null, { status: 200 })
  }),

  // PATCH /events/{eventId}/participants/{participantId}/reject
  http.patch(API('/events/:eventId/participants/:participantId/reject'), async ({ params }) => {
    await delay(120)
    const p = db.participants.find((p) => p.id === Number(params.participantId))
    if (!p) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    p.status = 'REJECTED'
    p.respondedAt = new Date().toISOString()
    return new HttpResponse(null, { status: 200 })
  }),
]
