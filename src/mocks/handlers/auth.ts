import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { User } from '@/shared/api/types'

function stripBearer(authorization: string | null): string | null {
  if (!authorization) return null
  const m = authorization.match(/^Bearer\s+(.+)$/i)
  return (m ? m[1] : authorization).trim()
}

function userFromXUserIdOrBearer(request: Request): User | null {
  const uid = request.headers.get('X-User-Id')
  if (uid) {
    const n = Number(uid)
    if (!Number.isNaN(n)) {
      const u = db.users.find((user) => user.id === n)
      if (u) return u
    }
  }
  return userFromAuthHeader(request.headers.get('Authorization'))
}

export const authHandlers = [
  // POST /auth/login
  http.post(API('/auth/login'), async ({ request }) => {
    await delay(150)
    const { firebaseIdToken } = (await request.json()) as { firebaseIdToken: string }
    if (!firebaseIdToken) {
      return HttpResponse.json({ message: 'firebaseIdToken required' }, { status: 400 })
    }
    // mock: 기본적으로 회장으로 로그인
    const user = db.users.find((u) => u.id === 101)!
    return HttpResponse.json({
      accessToken: 'dev-mock-token-president',
      isNewUser: false,
      user,
    })
  }),

  // POST /auth/signup — Authorization: 순수 토큰 또는 Bearer 모두 허용(목업: firebaseUid 문자열)
  http.post(API('/auth/signup'), async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as Partial<User>
    const firebaseSim = stripBearer(request.headers.get('Authorization'))
    const me =
      (firebaseSim && db.users.find((u) => u.firebaseUid === firebaseSim)) ??
      userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })

    me.nickname = body.nickname ?? me.nickname
    me.schoolId = body.schoolId ?? me.schoolId
    me.bio = body.bio ?? me.bio
    me.updatedAt = new Date().toISOString()
    return HttpResponse.json(me, { status: 201 })
  }),

  // GET /auth/me — Spring: X-User-Id 우선 (Bearer 목업 폴백)
  http.get(API('/auth/me'), async ({ request }) => {
    await delay(80)
    const me = userFromXUserIdOrBearer(request)
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    return HttpResponse.json(me)
  }),

  // GET /users/{id}
  http.get(API('/users/:id'), async ({ params }) => {
    await delay(80)
    const user = db.users.find((u) => u.id === Number(params.id))
    if (!user) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(user)
  }),

  // PATCH /users/me
  http.patch(API('/users/me'), async ({ request }) => {
    await delay(150)
    const me = userFromXUserIdOrBearer(request)
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const patch = (await request.json()) as Partial<User>
    Object.assign(me, patch, { updatedAt: new Date().toISOString() })
    return HttpResponse.json(me)
  }),
]
