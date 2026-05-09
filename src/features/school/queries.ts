import { useQuery } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import { ApiError } from '@/shared/api/error'
import type { FacilityType } from '@/shared/api/types'
import type { SchoolListQuery } from './api'
import { schoolApi } from './api'
import { applySchoolListQuery } from './school-list-utils'

export const schoolKeys = {
  all: ['school'] as const,
  list: (q: SchoolListQuery) => [...schoolKeys.all, 'list', q] as const,
  detail: (id: number) => [...schoolKeys.all, 'detail', id] as const,
  facilities: (id: number, facilityType?: FacilityType) =>
    [...schoolKeys.all, id, 'facilities', facilityType ?? 'all'] as const,
}

/** GET /schools + 클라(region / whitelistedOnly) 필터. */
export function useSchools(q: SchoolListQuery = { whitelistedOnly: true }) {
  return useQuery({
    queryKey: schoolKeys.list(q),
    queryFn: async () => {
      const rows = await schoolApi.list()
      return applySchoolListQuery(rows, q)
    },
    staleTime: STALE_TIMES.long,
  })
}

/** GET /schools/{id} */
export function useSchool(id: number) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: () => schoolApi.detail(id),
    staleTime: STALE_TIMES.long,
    enabled: id > 0,
  })
}

/** GET /schools/{id}/facilities (서버 미배포·오류 시 빈 목록). */
export function useSchoolFacilities(id: number, facilityType?: FacilityType) {
  return useQuery({
    queryKey: schoolKeys.facilities(id, facilityType),
    queryFn: async () => {
      try {
        const list = await schoolApi.facilities(id)
        return facilityType
          ? list.filter((f) => f.facilityType === facilityType)
          : list
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.isNotFound() || err.status === 403 || err.status === 0)
        ) {
          return []
        }
        throw err
      }
    },
    staleTime: STALE_TIMES.long,
    enabled: id > 0,
  })
}
