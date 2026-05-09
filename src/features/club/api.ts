import { BaseApi, apiClient } from '@/shared/api'
import type { Club, ClubCategory, ClubMember, ClubStatus } from '@/shared/api/types'

export interface ClubListQuery {
  schoolId?: number
  category?: ClubCategory
  status?: ClubStatus
}

export interface CreateClubRequest {
  schoolId: number
  name: string
  category: ClubCategory
  description?: string
  logoImage?: string
  evidenceUrl?: string
}

export interface UpdateClubRequest {
  description?: string
  logoImage?: string
  evidenceUrl?: string
  category?: ClubCategory
}

class ClubApi extends BaseApi {
  /**
   * GET /api/clubs — 로그인 사용자가 승인 부원으로 가입한 동아리만.
   * 선택 쿼리: schoolId, category, status (가입 목록 위 추가 필터).
   */
  list(q: ClubListQuery = {}) {
    return this.get<Club[]>('', { params: q })
  }
  /** 백엔드: GET /clubs/partner-options?hostClubId= — 승인 동아리 전역 − 주최 (주최 회장만) */
  partnerOptions(hostClubId: number) {
    return this.get<Club[]>('/partner-options', { params: { hostClubId } })
  }
  detail(id: number) {
    return this.get<Club>(`/${id}`)
  }
  create(body: CreateClubRequest) {
    return this.post<Club>('', body)
  }
  update(id: number, body: UpdateClubRequest) {
    return this.patch<Club>(`/${id}`, body)
  }
  /** POST /clubs/{id}/approve (X-User-Id) */
  approve(id: number) {
    return this.post<Club>(`/${id}/approve`)
  }
  /** POST /clubs/{id}/reject */
  reject(id: number, rejectReason: string) {
    return this.post<Club>(`/${id}/reject`, { rejectReason })
  }
  joinByCode(inviteCode: string) {
    return this.post<ClubMember>('/join', { inviteCode })
  }
  members(clubId: number) {
    return this.get<ClubMember[]>(`/${clubId}/members`)
  }
  removeMember(clubId: number, userId: number) {
    return this.delete<void>(`/${clubId}/members/${userId}`)
  }
}

export const clubApi = new ClubApi(apiClient, '/clubs')
