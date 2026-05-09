import type { EventType, School, SchoolFacility } from '@/shared/api/types'

/**
 * Nest AI step1 요청 본문 (Spring이 그대로 포워딩).
 * 초안 제목·카테고리는 아직 사용자가 확정한 값이 아니므로 넣지 않는다 — 넣으면 LLM이
 * `naturalText`(제출한 설명) 대신 기존 제목/카테고리에 끌려 엉뚱한 결과가 나기 쉽다.
 */
export function buildAiStep1Body(params: {
  naturalText: string
  eventType?: EventType
  hostClubName?: string
  partnerClubName?: string
  preferredArea?: string
}): Record<string, unknown> {
  const body: Record<string, unknown> = { naturalText: params.naturalText }
  if (params.eventType != null) body.eventType = params.eventType
  if (params.hostClubName) body.hostClubName = params.hostClubName
  if (params.partnerClubName) body.partnerClubName = params.partnerClubName
  if (params.preferredArea) body.preferredArea = params.preferredArea
  return body
}

export function schoolToAiPayload(s: School | undefined): Record<string, unknown> | null {
  if (s?.id == null) return null
  return {
    id: s.id,
    name: s.name,
    region: s.region,
    campusType: s.campusType,
    lat: s.lat,
    lng: s.lng,
  }
}

export function facilityToAiPayload(f: SchoolFacility): Record<string, unknown> {
  return {
    id: f.id,
    schoolId: f.schoolId,
    name: f.name,
    facilityType: f.facilityType,
    capacity: f.capacity,
    lat: f.lat,
    lng: f.lng,
  }
}
