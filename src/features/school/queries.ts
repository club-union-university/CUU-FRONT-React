import { useQuery } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import type { FacilityType } from '@/shared/api/types'
import { schoolApi, type SchoolListQuery } from './api'

export const schoolKeys = {
  all: ['school'] as const,
  list: (q: SchoolListQuery) => [...schoolKeys.all, 'list', q] as const,
  detail: (id: number) => [...schoolKeys.all, 'detail', id] as const,
  facilities: (id: number, facilityType?: FacilityType) =>
    [...schoolKeys.all, id, 'facilities', facilityType ?? 'all'] as const,
}

export function useSchools(q: SchoolListQuery = { whitelistedOnly: true }) {
  return useQuery({
    queryKey: schoolKeys.list(q),
    queryFn: () => schoolApi.list(q),
    staleTime: STALE_TIMES.long,
  })
}

export function useSchool(id: number) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: () => schoolApi.detail(id),
    staleTime: STALE_TIMES.long,
    enabled: id > 0,
  })
}

export function useSchoolFacilities(id: number, facilityType?: FacilityType) {
  return useQuery({
    queryKey: schoolKeys.facilities(id, facilityType),
    queryFn: () => schoolApi.facilities(id, facilityType),
    staleTime: STALE_TIMES.long,
    enabled: id > 0,
  })
}
