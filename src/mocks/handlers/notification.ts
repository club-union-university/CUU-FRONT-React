import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'

export const notificationHandlers = [
  // GET /notifications
  http.get(API('/notifications'), async ({ request }) => {
    await delay(100)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const url = new URL(request.url)
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
    let list = db.notifications.filter((n) => n.userId === me.id)
    if (unreadOnly) list = list.filter((n) => !n.isRead)
    return HttpResponse.json(list)
  }),

  // PATCH /notifications/{id}/read
  http.patch(API('/notifications/:id/read'), async ({ params }) => {
    await delay(60)
    const n = db.notifications.find((n) => n.id === Number(params.id))
    if (n) n.isRead = true
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH /notifications/read-all
  http.patch(API('/notifications/read-all'), async ({ request }) => {
    await delay(80)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    db.notifications.forEach((n) => {
      if (n.userId === me.id) n.isRead = true
    })
    return new HttpResponse(null, { status: 204 })
  }),
]
