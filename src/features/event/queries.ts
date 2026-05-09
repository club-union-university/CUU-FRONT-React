import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import type { Event, EventUpdateRequest } from '@/shared/api/types'
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
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EventAiStep1Body = {}) => eventApi.aiStep1(id, body),
    onSuccess: (data) => {
      // 서버가 step1 후 event.step1Data를 갱신해도, 상세 쿼리 캐시는 그대로라 Step2가 비어 있다고 판단함.
      // 응답 본문을 즉시 병합하고 GET으로 재동기화한다.
      qc.setQueryData<Event | undefined>(eventKeys.detail(id), (prev) => {
        if (!prev) return prev
        return { ...prev, step1Data: data as Event['step1Data'] }
      })
      void qc.invalidateQueries({ queryKey: eventKeys.detail(id) })
    },
  })
}

export function useEventAiStep2(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EventAiStep2Body = {}) => eventApi.aiStep2(id, body),
    onSuccess: (data) => {
      qc.setQueryData<Event | undefined>(eventKeys.detail(id), (prev) => {
        if (!prev) return prev
        return { ...prev, step2Data: data as Event['step2Data'] }
      })
      void qc.invalidateQueries({ queryKey: eventKeys.detail(id) })
    },
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
