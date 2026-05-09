import type { User } from '@/shared/api/types'

/**
 * 랜딩 `/`는 비로그인·홍보용. 인증 후 기본 진입은 목록 허브로 보낸다.
 */
export const DEFAULT_LOGGED_IN_PATH = '/clubs' as const

/** 슈퍼관리자 기본 진입 — 동아리 승인 등 관리 콘솔 */
export const DEFAULT_SUPER_ADMIN_PATH = '/admin/clubs' as const

export function defaultLoggedInPathForUser(user: User | null | undefined): typeof DEFAULT_LOGGED_IN_PATH | typeof DEFAULT_SUPER_ADMIN_PATH {
  return user?.role === 'SUPER_ADMIN' ? DEFAULT_SUPER_ADMIN_PATH : DEFAULT_LOGGED_IN_PATH
}
