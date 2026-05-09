import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { BoardType, Post } from '@/shared/api/types'

function filterScopedPosts(boardType: BoardType, scopeId: number, request: Request) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  let list = db.posts.filter((p) => p.boardType === boardType && p.targetId === scopeId)
  if (category) list = list.filter((p) => p.category === category)
  return list
}

async function createScopedPost(
  boardType: BoardType,
  targetId: number,
  headers: Headers,
  request: Request,
) {
  const me = userFromAuthHeader(headers.get('Authorization'))
  if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const body = (await request.json()) as Partial<Post>
  const post: Post = {
    id: db.nextId.post++,
    authorId: me.id!,
    boardType,
    targetId,
    category: body.category,
    isOfficialNotice: false,
    title: body.title ?? '',
    content: body.content ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.posts.push(post)
  return HttpResponse.json(post, { status: 201 })
}

export const postHandlers = [
  // GET /events/{eventId}/posts — Spring PostController
  http.get(API('/events/:eventId/posts'), async ({ params, request }) => {
    await delay(120)
    return HttpResponse.json(filterScopedPosts('EVENT', Number(params.eventId), request))
  }),

  // POST /events/{eventId}/posts
  http.post(API('/events/:eventId/posts'), async ({ params, request }) => {
    await delay(180)
    return createScopedPost('EVENT', Number(params.eventId), request.headers, request)
  }),

  // GET /schools/{schoolId}/posts — Spring PostController
  http.get(API('/schools/:schoolId/posts'), async ({ params, request }) => {
    await delay(120)
    return HttpResponse.json(filterScopedPosts('SCHOOL', Number(params.schoolId), request))
  }),

  http.post(API('/schools/:schoolId/posts'), async ({ params, request }) => {
    await delay(180)
    return createScopedPost('SCHOOL', Number(params.schoolId), request.headers, request)
  }),

  http.get(API('/clubs/:clubId/posts'), async ({ params, request }) => {
    await delay(120)
    return HttpResponse.json(filterScopedPosts('CLUB', Number(params.clubId), request))
  }),

  http.post(API('/clubs/:clubId/posts'), async ({ params, request }) => {
    await delay(180)
    return createScopedPost('CLUB', Number(params.clubId), request.headers, request)
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
