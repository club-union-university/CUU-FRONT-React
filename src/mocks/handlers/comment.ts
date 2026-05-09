import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { Comment } from '@/shared/api/types'

export const commentHandlers = [
  // GET /posts/{postId}/comments
  http.get(API('/posts/:postId/comments'), async ({ params }) => {
    await delay(100)
    const list = db.comments.filter((c) => c.postId === Number(params.postId))
    return HttpResponse.json(list)
  }),

  // POST /posts/{postId}/comments
  http.post(API('/posts/:postId/comments'), async ({ params, request }) => {
    await delay(150)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const { content } = (await request.json()) as { content: string }
    const comment: Comment = {
      id: db.nextId.comment++,
      postId: Number(params.postId),
      authorId: me.id!,
      content,
      createdAt: new Date().toISOString(),
    }
    db.comments.push(comment)
    return HttpResponse.json(comment, { status: 201 })
  }),

  // DELETE /comments/{id}
  http.delete(API('/comments/:id'), async ({ params }) => {
    await delay(120)
    const idx = db.comments.findIndex((c) => c.id === Number(params.id))
    if (idx >= 0) db.comments.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
