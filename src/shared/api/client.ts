import { env } from '@/shared/config/env'
import { createApiClient } from './base'
import { useAuthStore } from '@/features/auth/store'

/**
 * 앱 전역에서 쓰는 단일 axios 인스턴스.
 * - 토큰은 Zustand 스토어에서 lazy 조회 (순환 참조 회피용 함수 주입)
 * - 401이면 스토어 clear → 라우터 redirect는 컴포넌트/가드 레벨에서 처리
 */
export const apiClient = createApiClient({
  baseURL: env.API_BASE_URL,
  getToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => {
    useAuthStore.getState().clear()
  },
})
