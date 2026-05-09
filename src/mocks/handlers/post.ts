import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { Post } from '@/shared/api/types'

export const postHandlers = [
  // GET /posts
  http.get(API('/posts'), async ({ request }) => {
    await delay(120)
    const url = new URL(request.url)
    const boardType = url.searchParams.get('boardType')
    const targetId = url.searchParams.get('targetId')
    const category = url.searchParams.get('category')
    let list = [...db.posts]
    if (boardType) list = list.filter((p) => p.boardType === boardType)
    if (targetId) list = list.filter((p) => p.targetId === Number(targetId))
    if (category) list = list.filter((p) => p.category === category)
    return HttpResponse.json(list)
  }),

  // POST /posts
  http.post(API('/posts'), async ({ request }) => {
    await delay(180)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const body = (await request.json()) as Partial<Post>
    const post: Post = {
      id: db.nextId.post++,
      authorId: me.id!,
      boardType: body.boardType!,
      targetId: body.targetId!,
      category: body.category,
      isOfficialNotice: false,
      title: body.title ?? '',
      content: body.content ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.posts.push(post)
    return HttpResponse.json(post, { status: 201 })
  }),

  // GET /posts/{id}
  http.get(API('/posts/:id'), async ({ params }) => {
    await delay(80)
    const post = db.posts.find((p) => p.id === Number(params.id))
    if (!post) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(post)
  }),

  // PATCH /posts/{id}
  http.patch(API('/posts/:id'), async ({ params, request }) => {
    await delay(150)
    const post = db.posts.find((p) => p.id === Number(params.id))
    if (!post) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const patch = (await request.json()) as Partial<Post>
    Object.assign(post, patch, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(post)
  }),

  // DELETE /posts/{id}
  http.delete(API('/posts/:id'), async ({ params }) => {
    await delay(120)
    const idx = db.posts.findIndex((p) => p.id === Number(params.id))
    if (idx >= 0) db.posts.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
