import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/shared/api/types'

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (payload: { accessToken: string; user: User }) => void
  setUser: (user: User) => void
  clear: () => void
}

/**
 * 클라이언트 인증 상태.
 * - persist: localStorage에 토큰 + 사용자 보관 (refresh 토큰 흐름 도입 전 임시)
 * - 보안 강화 시 httpOnly 쿠키로 이관 고려
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: ({ accessToken, user }) =>
        set({ accessToken, user, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      clear: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'crew.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
)
