import { BaseApi, apiClient } from '@/shared/api'
import type { FacilityType, Region, School, SchoolFacility } from '@/shared/api/types'

export interface SchoolListQuery {
  region?: Region
  whitelistedOnly?: boolean
}

class SchoolApi extends BaseApi {
  list(q: SchoolListQuery = { whitelistedOnly: true }) {
    return this.get<School[]>('', { params: q })
  }
  detail(id: number) {
    return this.get<School>(`/${id}`)
  }
  facilities(id: number, facilityType?: FacilityType) {
    return this.get<SchoolFacility[]>(`/${id}/facilities`, {
      params: facilityType ? { facilityType } : undefined,
    })
  }
}

export const schoolApi = new SchoolApi(apiClient, '/schools')
