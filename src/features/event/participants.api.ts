import { BaseApi, apiClient } from '@/shared/api'
import type { EventParticipant, ParticipantStatus } from '@/shared/api/types'

class EventParticipantApi extends BaseApi {
  list(eventId: number, status?: ParticipantStatus) {
    return this.get<EventParticipant[]>(`/${eventId}/participants`, {
      params: status ? { status } : undefined,
    })
  }

  /** 행사 참여 신청. participatingRole은 사용하지 않는다. */
  apply(eventId: number) {
    return this.post<EventParticipant>(`/${eventId}/participants`, {})
  }

  approve(eventId: number, participantId: number) {
    return this.patch<void>(`/${eventId}/participants/${participantId}/approve`)
  }

  reject(eventId: number, participantId: number) {
    return this.patch<void>(`/${eventId}/participants/${participantId}/reject`)
  }
}

export const eventParticipantApi = new EventParticipantApi(apiClient, '/events')
