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
  aiStep1(id: number) {
    return this.post<Record<string, unknown>>(`/${id}/ai/step1`)
  }
  aiStep2(id: number) {
    return this.post<Record<string, unknown>>(`/${id}/ai/step2`)
  }

  // ===== 상태 전이 =====
  submitForPartner(id: number) {
    return this.post<Event>(`/${id}/submit`)
  }
  approve(id: number) {
    return this.patch<Event>(`/${id}/approve`)
  }
  reject(id: number, rejectReason: string) {
    return this.patch<Event>(`/${id}/reject`, { rejectReason })
  }
  startRecruiting(id: number) {
    return this.patch<Event>(`/${id}/recruiting`)
  }
  closeRecruiting(id: number) {
    return this.patch<void>(`/${id}/close`)
  }
}

export const eventApi = new EventApi(apiClient, '/events')
