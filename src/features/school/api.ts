import { BaseApi, apiClient } from '@/shared/api'
import type { Region, School, SchoolFacility } from '@/shared/api/types'

/** 클라에서 region / whitelistedOnly 로 추가 필터 (서버 GET 은 파라미터 없음). */
export interface SchoolListQuery {
  region?: Region
  whitelistedOnly?: boolean
}

class SchoolApi extends BaseApi {
  /**
   * Spring SchoolController GET /schools — 쿼리 없음, 서비스에서 이미 화이트리스트만 반환.
   * @see https://github.com/club-union-university/CUU-BACK-Spring
   */
  list() {
    return this.get<School[]>('')
  }

  detail(id: number) {
    return this.get<School>(`/${id}`)
  }

  facilities(id: number) {
    return this.get<SchoolFacility[]>(`/${id}/facilities`)
  }
}

export const schoolApi = new SchoolApi(apiClient, '/schools')
