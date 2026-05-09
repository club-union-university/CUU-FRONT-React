import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import type { EventUpdateRequest } from '@/shared/api/types'
import {
  eventApi,
  type CreateEventRequest,
  type EventAiStep1Body,
  type EventAiStep2Body,
  type EventListQuery,
} from './api'

export const eventKeys = {
  all: ['event'] as const,
  list: (q: EventListQuery) => [...eventKeys.all, 'list', q] as const,
  detail: (id: number) => [...eventKeys.all, 'detail', id] as const,
}

export function useEvents(q: EventListQuery = {}) {
  return useQuery({
    queryKey: eventKeys.list(q),
    queryFn: () => eventApi.list(q),
    staleTime: STALE_TIMES.short,
  })
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventApi.detail(id),
    staleTime: STALE_TIMES.short,
    enabled: id > 0,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEventRequest) => eventApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  })
}

export function useUpdateEvent(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EventUpdateRequest) => eventApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(id) })
      qc.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

export function useEventAiStep1(id: number) {
  return useMutation({
    mutationFn: (body: EventAiStep1Body = {}) => eventApi.aiStep1(id, body),
  })
}

export function useEventAiStep2(id: number) {
  return useMutation({
    mutationFn: (body: EventAiStep2Body = {}) => eventApi.aiStep2(id, body),
  })
}

export function useEventTransition(id: number) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: eventKeys.all })

  const submit = useMutation({ mutationFn: () => eventApi.submitForPartner(id), onSuccess: invalidate })
  const approve = useMutation({ mutationFn: () => eventApi.approve(id), onSuccess: invalidate })
  const reject = useMutation({
    mutationFn: (rejectReason: string) => eventApi.reject(id, rejectReason),
    onSuccess: invalidate,
  })
  const recruit = useMutation({ mutationFn: () => eventApi.startRecruiting(id), onSuccess: invalidate })
  const close = useMutation({ mutationFn: () => eventApi.closeRecruiting(id), onSuccess: invalidate })

  return { submit, approve, reject, recruit, close }
}
