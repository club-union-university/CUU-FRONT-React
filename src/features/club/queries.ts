import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import { clubApi, type ClubListQuery, type CreateClubRequest, type UpdateClubRequest } from './api'

export const clubKeys = {
  all: ['club'] as const,
  list: (q: ClubListQuery) => [...clubKeys.all, 'list', q] as const,
  detail: (id: number) => [...clubKeys.all, 'detail', id] as const,
  members: (clubId: number) => [...clubKeys.all, clubId, 'members'] as const,
}

export function useClubs(q: ClubListQuery = {}) {
  return useQuery({
    queryKey: clubKeys.list(q),
    queryFn: () => clubApi.list(q),
    staleTime: STALE_TIMES.medium,
  })
}

export function useClub(id: number) {
  return useQuery({
    queryKey: clubKeys.detail(id),
    queryFn: () => clubApi.detail(id),
    staleTime: STALE_TIMES.medium,
    enabled: id > 0,
  })
}

export function useClubMembers(clubId: number) {
  return useQuery({
    queryKey: clubKeys.members(clubId),
    queryFn: () => clubApi.members(clubId),
    staleTime: STALE_TIMES.short,
    enabled: clubId > 0,
  })
}

export function useCreateClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClubRequest) => clubApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.all }),
  })
}

export function useUpdateClub(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateClubRequest) => clubApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clubKeys.detail(id) })
      qc.invalidateQueries({ queryKey: clubKeys.all })
    },
  })
}

export function useJoinClubByCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (inviteCode: string) => clubApi.joinByCode(inviteCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.all }),
  })
}

export function useApproveClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clubApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.all }),
  })
}

export function useRejectClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; rejectReason: string }) =>
      clubApi.reject(vars.id, vars.rejectReason),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.all }),
  })
}
