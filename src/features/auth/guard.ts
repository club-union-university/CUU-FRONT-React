import { redirect } from '@tanstack/react-router'
import { defaultLoggedInPathForUser } from './paths'
import { userNeedsProfileCompletion } from './profile-completion'
import { useAuthStore } from './store'

/**
 * TanStack Router beforeLoad 가드 헬퍼.
 * 인증 안 됨 → /login (redirect 파라미터 보존)
 * 인증됐는데 signup 미완료 → /signup
 */
export function requireAuth(currentPath: string) {
  const { isAuthenticated, requiresSignup, user } = useAuthStore.getState()
  if (!isAuthenticated) {
    throw redirect({ to: '/login', search: { redirect: currentPath } })
  }
  const mustFinishSignup = requiresSignup || userNeedsProfileCompletion(user)
  if (mustFinishSignup && !currentPath.startsWith('/signup')) {
    throw redirect({ to: '/signup' })
  }
}

/**
 * POST /auth/signup: requiresSignup (isNewUser 또는 닉네임·학교 미기입) 인 경우만.
 * 이미 마친 사용자는 접근 차단한다.
 */
export function requireSignupIncomplete(currentPath: string) {
  requireAuth(currentPath)
  const { requiresSignup, user } = useAuthStore.getState()
  if (!requiresSignup && !userNeedsProfileCompletion(user)) {
    throw redirect({ to: defaultLoggedInPathForUser(user) })
  }
}

/** 이미 로그인된 사용자가 /login 접근하면 홈으로. */
export function redirectIfAuthed() {
  const { isAuthenticated, requiresSignup, user } = useAuthStore.getState()
  if (isAuthenticated) {
    const toSignup = requiresSignup || userNeedsProfileCompletion(user)
    throw redirect({ to: toSignup ? '/signup' : defaultLoggedInPathForUser(user) })
  }
}

/** Super Admin 전용 라우트 가드. */
export function requireSuperAdmin(currentPath: string) {
  requireAuth(currentPath)
  const { user } = useAuthStore.getState()
  if (user?.role !== 'SUPER_ADMIN') {
    throw redirect({ to: defaultLoggedInPathForUser(user) })
  }
}

/** 회장(PRESIDENT) 전용 라우트 가드. */
export function requirePresident(currentPath: string) {
  requireAuth(currentPath)
  const { user } = useAuthStore.getState()
  if (user?.role !== 'PRESIDENT' && user?.role !== 'SUPER_ADMIN') {
    throw redirect({ to: defaultLoggedInPathForUser(user) })
  }
}
