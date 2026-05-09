import { BaseApi, apiClient } from '@/shared/api'
import type { ChatMessage, ChatRoom, ChatRoomMember, MessageType } from '@/shared/api/types'

class ChatRoomLookupApi extends BaseApi {
  forEvent(eventId: number) {
    return this.get<ChatRoom>(`/${eventId}/chat-room`)
  }
}

class ChatRoomApi extends BaseApi {
  join(id: number) {
    return this.post<ChatRoomMember>(`/${id}/join`)
  }
  messages(id: number, opts?: { before?: number; limit?: number }) {
    return this.get<ChatMessage[]>(`/${id}/messages`, { params: opts })
  }
  send(id: number, content: string, messageType: MessageType = 'TEXT') {
    return this.post<ChatMessage>(`/${id}/messages`, { content, messageType })
  }
  read(id: number) {
    return this.patch<void>(`/${id}/read`)
  }
  triggerBot(id: number, type: 'BOT_WELCOME' | 'BOT_REMINDER') {
    return this.post<ChatMessage>(`/${id}/bot/trigger`, { type })
  }
}

export const chatRoomLookupApi = new ChatRoomLookupApi(apiClient, '/events')
export const chatRoomApi = new ChatRoomApi(apiClient, '/chat-rooms')
