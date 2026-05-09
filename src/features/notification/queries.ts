import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import { ApiError } from '@/shared/api/error'
import { notificationApi } from './api'

export const notificationKeys = {
  all: ['notification'] as const,
  list: (unreadOnly: boolean) => [...notificationKeys.all, 'list', unreadOnly] as const,
}

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: async () => {
      try {
        return await notificationApi.list(unreadOnly)
      } catch (err) {
        // Railway/Spring 에 엔드포인드·역할 규칙이 다르거나 미배포일 때 UI 유지 (403 흔함)
        if (err instanceof ApiError && (err.status === 401 || err.status === 403))
          return []
        throw err
      }
    },
    staleTime: STALE_TIMES.short,
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApi.readAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
