import type { User } from '@/shared/api/types'

/**
 * 백엔드가 isNewUser 를 빼먹거나 false 인 경우에도,
 * 닉네임·학교가 비어 있으면 POST /auth/signup(프로필 완료)로 보낸다.
 */
export function userNeedsProfileCompletion(user: User | null | undefined): boolean {
  if (!user) return true
  const nick = user.nickname?.trim() ?? ''
  if (nick.length < 2) return true
  const sid = user.schoolId
  if (typeof sid !== 'number' || !Number.isFinite(sid) || sid <= 0) return true
  return false
}

export function userRequiresSignupAfterLogin(
  isNewUserFromApi: boolean | undefined,
  user: User | null | undefined,
): boolean {
  return Boolean(isNewUserFromApi) || userNeedsProfileCompletion(user)
}
