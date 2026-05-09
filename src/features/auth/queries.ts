import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import type { User, UserRole } from '@/shared/api/types'
import { authApi, userApi, type SignupRequest, type UpdateProfileRequest } from './api'
import { userRequiresSignupAfterLogin } from './profile-completion'
import { useAuthStore, removeAuthPersistedSnapshot } from './store'
import { isFirebaseConfigured } from '@/shared/firebase/app'

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
  const setPendingFirebaseIdToken = useAuthStore((s) => s.setPendingFirebaseIdToken)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (firebaseIdToken: string) => authApi.login(firebaseIdToken),
    onSuccess: (data, firebaseIdToken) => {
      const needsSignup = userRequiresSignupAfterLogin(data.isNewUser, data.user)
      setAuth({ accessToken: data.accessToken, user: data.user, isNewUser: needsSignup })
      if (needsSignup && firebaseIdToken) {
        setPendingFirebaseIdToken(firebaseIdToken)
      } else {
        setPendingFirebaseIdToken(null)
      }
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

/** 백엔드 테스트용: 내 역할을 SUPER_ADMIN / PRESIDENT / MEMBER 로 전환 */
export function useUpdateMyRole() {
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (role: UserRole) => userApi.updateMyRole(role),
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
    removeAuthPersistedSnapshot()
    // Google 로그인 세션도 끊어야 다음 로그인 시 완전히 새 토큰을 받기 쉽다.
    if (isFirebaseConfigured()) {
      void import('firebase/auth').then(({ signOut }) =>
        import('@/shared/firebase/app').then(({ getFirebaseAuth }) =>
          signOut(getFirebaseAuth()).catch(() => {}),
        ),
      )
    }
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

/** MSW mocks/db 사용자 시드와 동일 (POST /auth/signup Authorization 에 실음). */
const DEV_MOCK_FIREBASE_UID: Record<number, string> = {
  100: 'mock-super',
  101: 'mock-pres-1',
  102: 'mock-member',
  103: 'mock-pres-2',
  104: 'mock-pres-3',
  105: 'mock-pres-4',
  106: 'mock-pres-5',
}

export function useDevMockLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setPendingFirebaseIdToken = useAuthStore((s) => s.setPendingFirebaseIdToken)
  return (opts: DevLoginOpts = {}) => {
    const role = opts.role ?? 'MEMBER'
    const id = opts.id ?? ROLE_DEFAULT_ID[role]
    const firebaseUid = DEV_MOCK_FIREBASE_UID[id] ?? `mock-user-${id}`
    setAuth({
      accessToken: `dev-mock-token-${role.toLowerCase()}`,
      user: {
        id,
        firebaseUid,
        authProvider: 'GOOGLE',
        email: `${role.toLowerCase()}@aingthon.local`,
        nickname: opts.isNewUser ? '' : (opts.nickname ?? `데모-${role}`),
        schoolId: 1,
        bio: '',
        role,
      },
      isNewUser: !!opts.isNewUser,
    })
    // Spring signup: Authorization ≈ Firebase ID 토큰 — 목업에서는 firebaseUid 문자열을 토큰으로 사용
    setPendingFirebaseIdToken(opts.isNewUser ? firebaseUid : null)
  }
}
