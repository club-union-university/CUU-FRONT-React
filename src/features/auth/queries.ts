import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import type { User, UserRole } from '@/shared/api/types'
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
 * 개발용 mock 로그인 — Firebase/백엔드 미설정 환경에서 시연/개발 진행용.
 * UserRole(SUPER_ADMIN/PRESIDENT/MEMBER)을 시뮬레이션해 화면 분기를 검증한다.
 */
export interface DevLoginOpts {
  role?: UserRole
  isNewUser?: boolean
  /** 같은 role이라도 사용자별 id를 다르게 — club president 매칭 시뮬레이션용 */
  id?: number
  nickname?: string
}

const ROLE_DEFAULT_ID: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  PRESIDENT: 101,
  MEMBER: 102,
}

export function useDevMockLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return (opts: DevLoginOpts = {}) => {
    const role = opts.role ?? 'MEMBER'
    setAuth({
      accessToken: `dev-mock-token-${role.toLowerCase()}`,
      user: {
        id: opts.id ?? ROLE_DEFAULT_ID[role],
        firebaseUid: `dev-${role.toLowerCase()}`,
        authProvider: 'GOOGLE',
        email: `${role.toLowerCase()}@aingthon.local`,
        nickname: opts.isNewUser ? '' : (opts.nickname ?? `데모-${role}`),
        schoolId: 1,
        bio: '',
        role,
      },
      isNewUser: !!opts.isNewUser,
    })
  }
}
