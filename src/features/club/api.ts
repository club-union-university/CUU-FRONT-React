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
  /** GET /api/clubs — 서버 선택 쿼리: schoolId, category, status (Spring ClubController 와 동일). */
  list(q: ClubListQuery = {}) {
    return this.get<Club[]>('', { params: q })
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
