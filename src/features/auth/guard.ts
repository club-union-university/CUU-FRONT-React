import { redirect } from '@tanstack/react-router'
import { useAuthStore } from './store'

/**
 * TanStack Router beforeLoad 가드 헬퍼.
 * 인증 안 됨 → /login (redirect 파라미터 보존)
 * 인증됐는데 signup 미완료 → /signup
 */
export function requireAuth(currentPath: string) {
  const { isAuthenticated, requiresSignup } = useAuthStore.getState()
  if (!isAuthenticated) {
    throw redirect({ to: '/login', search: { redirect: currentPath } })
  }
  if (requiresSignup && !currentPath.startsWith('/signup')) {
    throw redirect({ to: '/signup' })
  }
}

/** 이미 로그인된 사용자가 /login 접근하면 홈으로. */
export function redirectIfAuthed() {
  const { isAuthenticated, requiresSignup } = useAuthStore.getState()
  if (isAuthenticated) {
    throw redirect({ to: requiresSignup ? '/signup' : '/' })
  }
}

/** Super Admin 전용 라우트 가드. */
export function requireSuperAdmin(currentPath: string) {
  requireAuth(currentPath)
  const { user } = useAuthStore.getState()
  if (user?.role !== 'SUPER_ADMIN') {
    throw redirect({ to: '/' })
  }
}

/** 회장(PRESIDENT) 전용 라우트 가드. */
export function requirePresident(currentPath: string) {
  requireAuth(currentPath)
  const { user } = useAuthStore.getState()
  if (user?.role !== 'PRESIDENT' && user?.role !== 'SUPER_ADMIN') {
    throw redirect({ to: '/' })
  }
}
