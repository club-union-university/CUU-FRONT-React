import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import type { ParticipantStatus } from '@/shared/api/types'
import { eventParticipantApi } from './participants.api'

export const participantKeys = {
  all: (eventId: number) => ['event', eventId, 'participants'] as const,
  list: (eventId: number, status?: ParticipantStatus) =>
    [...participantKeys.all(eventId), status ?? 'ALL'] as const,
}

export function useEventParticipants(eventId: number, status?: ParticipantStatus) {
  return useQuery({
    queryKey: participantKeys.list(eventId, status),
    queryFn: () => eventParticipantApi.list(eventId, status),
    staleTime: STALE_TIMES.short,
    enabled: eventId > 0,
  })
}

export function useApplyToEvent(eventId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => eventParticipantApi.apply(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: participantKeys.all(eventId) }),
  })
}

export function useApproveParticipant(eventId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participantId: number) => eventParticipantApi.approve(eventId, participantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: participantKeys.all(eventId) }),
  })
}

export function useRejectParticipant(eventId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participantId: number) => eventParticipantApi.reject(eventId, participantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: participantKeys.all(eventId) }),
  })
}
