import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api'

/**
 * 전역 QueryClient.
 * - 4xx (인증/권한/검증)은 retry 안 함
 * - 5xx/네트워크 오류만 1회 재시도
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500) return false
        }
        return failureCount < 1
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
