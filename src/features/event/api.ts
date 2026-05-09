import { BaseApi, apiClient } from '@/shared/api'
import type {
  Event,
  EventCategory,
  EventStatus,
  EventType,
  EventUpdateRequest,
} from '@/shared/api/types'

export interface EventListQuery {
  type?: EventType
  status?: EventStatus
  hostClubId?: number
  category?: EventCategory
}

export interface CreateEventRequest {
  type: EventType
  hostClubId: number
  partnerClubId?: number
  title: string
  category?: EventCategory
  description?: string
  format?: string
  proposalMessage?: string
}

/** AI step1 — 백엔드가 그대로 Nest로 포워딩 */
export type EventAiStep1Body = Record<string, unknown>

/** AI step2 — step1Result·schools·facilities 등 Nest 계약에 맞춤 */
export type EventAiStep2Body = Record<string, unknown>

class EventApi extends BaseApi {
  list(q: EventListQuery = {}) {
    return this.get<Event[]>('', { params: q })
  }
  detail(id: number) {
    return this.get<Event>(`/${id}`)
  }
  create(body: CreateEventRequest) {
    return this.post<Event>('', body)
  }
  update(id: number, body: EventUpdateRequest) {
    return this.patch<Event>(`/${id}`, body)
  }
  remove(id: number) {
    return this.delete<void>(`/${id}`)
  }

  // ===== 행사 초안 자동 작성(서버 step) =====
  aiStep1(id: number, body: EventAiStep1Body = {}) {
    return this.post<Record<string, unknown>>(`/${id}/ai/step1`, body)
  }
  aiStep2(id: number, body: EventAiStep2Body = {}) {
    return this.post<Record<string, unknown>>(`/${id}/ai/step2`, body)
  }

  // ===== 상태 전이 =====
  submitForPartner(id: number) {
    return this.post<Event>(`/${id}/submit`)
  }
  approve(id: number) {
    return this.post<Event>(`/${id}/approve`)
  }
  reject(id: number, rejectReason: string) {
    return this.post<Event>(`/${id}/reject`, { rejectReason })
  }
  /** Spring: POST /events/{id}/recruit */
  startRecruiting(id: number) {
    return this.post<Event>(`/${id}/recruit`)
  }
  closeRecruiting(id: number) {
    return this.post<Event>(`/${id}/close`)
  }
}

export const eventApi = new EventApi(apiClient, '/events')
