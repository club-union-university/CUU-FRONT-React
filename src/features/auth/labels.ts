import type { UserRole } from '@/shared/api/types'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: '관리자',
  PRESIDENT: '회장',
  MEMBER: '부원',
}

export function userRoleLabel(role?: UserRole | null) {
  if (!role) return ''
  return USER_ROLE_LABELS[role]
}
