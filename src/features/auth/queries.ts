import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import type { User } from '@/shared/api/types'
import { authApi, userApi, type SignupRequest, type UpdateProfileRequest } from './api'
import { useAuthStore } from './store'

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  user: (id: number) => ['user', id] as const,
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    staleTime: STALE_TIMES.medium,
    enabled,
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: authKeys.user(id),
    queryFn: () => userApi.getById(id),
    staleTime: STALE_TIMES.medium,
    enabled: id > 0,
  })
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (firebaseIdToken: string) => authApi.login(firebaseIdToken),
    onSuccess: (data) => {
      setAuth({ accessToken: data.accessToken, user: data.user, isNewUser: data.isNewUser })
      qc.setQueryData(authKeys.me(), data.user)
    },
  })
}

export function useSignup() {
  const setUser = useAuthStore((s) => s.setUser)
  const completeSignup = useAuthStore((s) => s.completeSignup)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SignupRequest) => authApi.signup(body),
    onSuccess: (user: User) => {
      setUser(user)
      completeSignup()
      qc.setQueryData(authKeys.me(), user)
    },
  })
}

export function useUpdateMe() {
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => userApi.updateMe(body),
    onSuccess: (user: User) => {
      setUser(user)
      qc.setQueryData(authKeys.me(), user)
    },
  })
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear)
  const qc = useQueryClient()
  return () => {
    clear()
    qc.clear()
  }
}

/**
 * 개발용 mock 로그인 — Firebase 미설정 환경에서 시연/개발 진행용.
 * 백엔드가 없을 때도 작동하도록 직접 store에 fake auth 주입.
 */
export function useDevMockLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return (opts?: { role?: User['role']; isNewUser?: boolean }) => {
    setAuth({
      accessToken: 'dev-mock-token',
      user: {
        id: 1,
        firebaseUid: 'dev-uid',
        authProvider: 'GOOGLE',
        email: 'dev@aingthon.local',
        nickname: opts?.isNewUser ? '' : '데모유저',
        schoolId: 1,
        personalRole: 'FRONTEND',
        bio: '',
        role: opts?.role ?? 'PRESIDENT',
      },
      isNewUser: !!opts?.isNewUser,
    })
  }
}
