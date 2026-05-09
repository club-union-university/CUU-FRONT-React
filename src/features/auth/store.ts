import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/shared/api/types'

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  /** 백엔드 login 응답에서 isNewUser=true일 때 set. signup 완료시 false로. */
  requiresSignup: boolean
  setAuth: (payload: { accessToken: string; user: User; isNewUser?: boolean }) => void
  setUser: (user: User) => void
  completeSignup: () => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      requiresSignup: false,
      setAuth: ({ accessToken, user, isNewUser }) =>
        set({
          accessToken,
          user,
          isAuthenticated: true,
          requiresSignup: !!isNewUser,
        }),
      setUser: (user) => set({ user }),
      completeSignup: () => set({ requiresSignup: false }),
      clear: () =>
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          requiresSignup: false,
        }),
    }),
    {
      name: 'crew.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        requiresSignup: s.requiresSignup,
      }),
    },
  ),
)
