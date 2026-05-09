import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import { chatRoomApi, chatRoomLookupApi } from './api'

export const chatKeys = {
  all: ['chat'] as const,
  room: (eventId: number) => [...chatKeys.all, 'room', eventId] as const,
  messages: (chatRoomId: number) => [...chatKeys.all, 'messages', chatRoomId] as const,
}

export function useChatRoomForEvent(eventId: number) {
  return useQuery({
    queryKey: chatKeys.room(eventId),
    queryFn: () => chatRoomLookupApi.forEvent(eventId),
    staleTime: STALE_TIMES.long,
    enabled: eventId > 0,
  })
}

export function useChatMessages(chatRoomId: number) {
  return useQuery({
    queryKey: chatKeys.messages(chatRoomId),
    queryFn: () => chatRoomApi.messages(chatRoomId),
    staleTime: 0,
    enabled: chatRoomId > 0,
    refetchInterval: 3000, // STOMP 도입 전까지 폴링
  })
}

export function useJoinChatRoom() {
  return useMutation({ mutationFn: (chatRoomId: number) => chatRoomApi.join(chatRoomId) })
}

export function useSendChatMessage(chatRoomId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => chatRoomApi.send(chatRoomId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.messages(chatRoomId) }),
  })
}

export function useTriggerBot(chatRoomId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (type: 'BOT_WELCOME' | 'BOT_REMINDER') =>
      chatRoomApi.triggerBot(chatRoomId, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.messages(chatRoomId) }),
  })
}

export function useMarkChatRead(chatRoomId: number) {
  return useMutation({ mutationFn: () => chatRoomApi.read(chatRoomId) })
}
