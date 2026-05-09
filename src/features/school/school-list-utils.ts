import type { School } from '@/shared/api/types'
import type { SchoolListQuery } from './api'

/** 서버가 준 목록에 region / 화이트리스트 필터만 적용 (Spring GET /schools 는 쿼리 없음). */
export function applySchoolListQuery(rows: readonly School[], q: SchoolListQuery): School[] {
  let list = [...rows]
  if (q.region) {
    list = list.filter((s) => s.region === q.region)
  }
  if (q.whitelistedOnly) {
    list = list.filter((s) => s.isWhitelisted !== false)
  }
  return list
}

function hostMatchesSchoolDomain(host: string, schoolDomain: string): boolean {
  const h = host.toLowerCase()
  const d = schoolDomain.toLowerCase()
  return h === d || h.endsWith(`.${d}`)
}

/** GET /schools 로 받은 목록에서 로그인 이메일 도메인과 맞는 학교 (서브도메인 허용). */
export function matchSchoolByEmail(
  schools: readonly School[],
  email: string | null | undefined,
): School | undefined {
  if (!email?.includes('@')) return undefined
  const host = email.split('@').pop()!.trim().toLowerCase()
  if (!host) return undefined
  return schools.find(
    (s) => s.emailDomain && hostMatchesSchoolDomain(host, s.emailDomain),
  )
}

export function formatSchoolDisplayName(schoolId: number | null | undefined): string {
  if (schoolId == null || schoolId <= 0) return '소속 학교 정보 없음'
  return `학교 #${schoolId}`
}
