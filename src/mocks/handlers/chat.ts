import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db, userFromAuthHeader } from '../db'
import type { ChatMessage, ChatRoomMember, MessageType } from '@/shared/api/types'

export const chatHandlers = [
  // GET /events/{eventId}/chat-room
  http.get(API('/events/:eventId/chat-room'), async ({ params }) => {
    await delay(100)
    const room = db.chatRooms.find((r) => r.eventId === Number(params.eventId))
    if (!room) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(room)
  }),

  // POST /chat-rooms/{id}/join
  http.post(API('/chat-rooms/:id/join'), async ({ params, request }) => {
    await delay(120)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const chatRoomId = Number(params.id)
    const existing = db.chatRoomMembers.find(
      (m) => m.chatRoomId === chatRoomId && m.userId === me.id,
    )
    if (existing) return HttpResponse.json(existing)
    const member: ChatRoomMember = {
      id: db.nextId.chatRoom++,
      chatRoomId,
      userId: me.id!,
      joinedAt: new Date().toISOString(),
      lastReadAt: new Date().toISOString(),
    }
    db.chatRoomMembers.push(member)
    return HttpResponse.json(member)
  }),

  // GET /chat-rooms/{id}/messages
  http.get(API('/chat-rooms/:id/messages'), async ({ params, request }) => {
    await delay(100)
    const url = new URL(request.url)
    const before = url.searchParams.get('before')
    const limit = Number(url.searchParams.get('limit') ?? '50')
    let list = db.chatMessages.filter((m) => m.chatRoomId === Number(params.id))
    if (before) list = list.filter((m) => (m.id ?? 0) < Number(before))
    list = list.slice(-limit)
    return HttpResponse.json(list)
  }),

  // POST /chat-rooms/{id}/messages
  http.post(API('/chat-rooms/:id/messages'), async ({ params, request }) => {
    await delay(120)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const body = (await request.json()) as { content: string; messageType?: MessageType }
    const message: ChatMessage = {
      id: db.nextId.chatMessage++,
      chatRoomId: Number(params.id),
      senderType: 'USER',
      senderUserId: me.id,
      content: body.content,
      messageType: body.messageType ?? 'TEXT',
      createdAt: new Date().toISOString(),
    }
    db.chatMessages.push(message)
    return HttpResponse.json(message, { status: 201 })
  }),

  // PATCH /chat-rooms/{id}/read
  http.patch(API('/chat-rooms/:id/read'), async ({ params, request }) => {
    await delay(80)
    const me = userFromAuthHeader(request.headers.get('Authorization'))
    if (!me) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const member = db.chatRoomMembers.find(
      (m) => m.chatRoomId === Number(params.id) && m.userId === me.id,
    )
    if (member) member.lastReadAt = new Date().toISOString()
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /chat-rooms/{id}/bot/trigger
  http.post(API('/chat-rooms/:id/bot/trigger'), async ({ params, request }) => {
    await delay(800)
    const { type } = (await request.json()) as { type: 'BOT_WELCOME' | 'BOT_REMINDER' }
    const room = db.chatRooms.find((r) => r.id === Number(params.id))
    if (!room) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const content =
      type === 'BOT_WELCOME'
        ? '환영합니다! 행사 채팅방에 입장하셨어요. 팀빌딩은 #팀빌딩 게시판에 부탁드립니다.'
        : '리마인더: 모집 마감이 다가옵니다. 아직 신청 안 한 분은 서둘러 주세요!'
    const message: ChatMessage = {
      id: db.nextId.chatMessage++,
      chatRoomId: room.id!,
      senderType: 'BOT',
      botPersona: room.botPersona,
      content,
      messageType: 'BOT_CARD',
      createdAt: new Date().toISOString(),
    }
    db.chatMessages.push(message)
    return HttpResponse.json(message)
  }),
]
