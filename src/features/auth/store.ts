import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/shared/api/types'

/** Zustand persist 키 — 로그아웃 시 localStorage에서 함께 제거 */
export const AUTH_STORAGE_KEY = 'cuu.auth'

export function removeAuthPersistedSnapshot(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    /* private mode 등 */
  }
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  /** 백엔드 login 응답에서 isNewUser=true일 때 set. signup 완료시 false로. */
  requiresSignup: boolean
  /**
   * 회원가입(POST /auth/signup) Authorization 에 실을 Firebase ID 토큰.
   * Spring CUU: signup 은 자체 JWT 대신 Firebase 검증. persist 하지 않음.
   */
  pendingFirebaseIdToken: string | null
  setAuth: (payload: { accessToken: string; user: User; isNewUser?: boolean }) => void
  setUser: (user: User) => void
  setPendingFirebaseIdToken: (token: string | null) => void
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
      pendingFirebaseIdToken: null,
      setAuth: ({ accessToken, user, isNewUser }) =>
        set({
          accessToken,
          user,
          isAuthenticated: true,
          requiresSignup: !!isNewUser,
        }),
      setUser: (user) => set({ user }),
      setPendingFirebaseIdToken: (pendingFirebaseIdToken) => set({ pendingFirebaseIdToken }),
      completeSignup: () => set({ requiresSignup: false, pendingFirebaseIdToken: null }),
      clear: () =>
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          requiresSignup: false,
          pendingFirebaseIdToken: null,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
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
