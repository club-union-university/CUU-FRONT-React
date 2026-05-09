import type { School } from '@/shared/api/types'
import type { SchoolListQuery } from './api'

/**
 * Spring GET /schools 미구현(404) 대비 — MSW DB와 동일한 경인권 화이트리스트.
 * 백엔드 schoolId와 맞추면 POST /auth/signup 시 충돌이 없다.
 */
export const GYEONGIN_WHITELIST_SCHOOLS: readonly School[] = [
  {
    id: 1,
    name: '한양대학교 ERICA',
    emailDomain: 'hanyang.ac.kr',
    region: 'GYEONGIN',
    campusType: 'BRANCH',
    isWhitelisted: true,
  },
  {
    id: 2,
    name: '인하대학교',
    emailDomain: 'inha.ac.kr',
    region: 'GYEONGIN',
    campusType: 'MAIN',
    isWhitelisted: true,
  },
  {
    id: 3,
    name: '아주대학교',
    emailDomain: 'ajou.ac.kr',
    region: 'GYEONGIN',
    campusType: 'MAIN',
    isWhitelisted: true,
  },
  {
    id: 4,
    name: '가천대학교',
    emailDomain: 'gachon.ac.kr',
    region: 'GYEONGIN',
    campusType: 'MAIN',
    isWhitelisted: true,
  },
  {
    id: 5,
    name: '인천대학교',
    emailDomain: 'inu.ac.kr',
    region: 'GYEONGIN',
    campusType: 'MAIN',
    isWhitelisted: true,
  },
]

function hostMatchesSchoolDomain(host: string, schoolDomain: string): boolean {
  const h = host.toLowerCase()
  const d = schoolDomain.toLowerCase()
  return h === d || h.endsWith(`.${d}`)
}

/** Google 등 로그인 이메일 호스트로 소속 학교 판별 (서브도메인 허용). */
export function schoolFromLoginEmail(email: string | null | undefined): School | undefined {
  if (!email?.includes('@')) return undefined
  const host = email.split('@').pop()!.trim().toLowerCase()
  if (!host) return undefined
  return GYEONGIN_WHITELIST_SCHOOLS.find(
    (s) => s.emailDomain && hostMatchesSchoolDomain(host, s.emailDomain),
  )
}

/** 서버 또는 로컬 목록 공통 필터(region, whitelist 플래그). */
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

export function filterLocalSchoolList(q: SchoolListQuery): School[] {
  return applySchoolListQuery(GYEONGIN_WHITELIST_SCHOOLS, q)
}

/** 회원가입 폼: 백엔드에 schoolId가 있으면 우선, 없으면 이메일 도메인. */
export function schoolForSignup(user: { email?: string; schoolId?: number } | null | undefined) {
  if (!user) return undefined
  if (typeof user.schoolId === 'number' && user.schoolId > 0) {
    const byId = schoolByLocalId(user.schoolId)
    if (byId) return byId
  }
  return schoolFromLoginEmail(user.email)
}

export function schoolByLocalId(id: number): School | undefined {
  return GYEONGIN_WHITELIST_SCHOOLS.find((s) => s.id === id)
}

/** 사용자 · 프로필 등에서 학교명 표시 (로컬 화이트리스트 또는 fallback). */
export function formatSchoolDisplayName(schoolId: number | null | undefined): string {
  if (schoolId == null || schoolId <= 0) return '소속 학교 정보 없음'
  const s = schoolByLocalId(schoolId)
  return s?.name ?? `학교 #${schoolId}`
}
