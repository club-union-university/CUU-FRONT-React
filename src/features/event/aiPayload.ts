import type {
  EventCategory,
  EventType,
  EventUpdateRequest,
  School,
  SchoolFacility,
} from '@/shared/api/types'

const EVENT_CATEGORY_VALUES: readonly EventCategory[] = [
  'HACKATHON',
  'MEETUP',
  'STUDY',
  'FESTIVAL',
  'WORKSHOP',
]

/** Step1 폼의 카테고리 문자열 → OpenAPI enum (대문자 영문만 허용) */
export function parseEventCategory(raw: string | undefined): EventCategory | undefined {
  if (!raw?.trim()) return undefined
  const u = raw.trim().toUpperCase()
  return EVENT_CATEGORY_VALUES.includes(u as EventCategory) ? (u as EventCategory) : undefined
}

function placeRecordToLocationPatch(
  o: Record<string, unknown>,
): Pick<
  EventUpdateRequest,
  'locationName' | 'locationAddress' | 'locationLat' | 'locationLng' | 'placeId'
> {
  const patch: Pick<
    EventUpdateRequest,
    'locationName' | 'locationAddress' | 'locationLat' | 'locationLng' | 'placeId'
  > = {}
  if (typeof o.name === 'string' && o.name.trim()) patch.locationName = o.name.trim()
  if (typeof o.address === 'string' && o.address.trim()) patch.locationAddress = o.address.trim()
  if (typeof o.lat === 'number') patch.locationLat = o.lat
  if (typeof o.lng === 'number') patch.locationLng = o.lng
  if (typeof o.placeId === 'string' && o.placeId.trim()) patch.placeId = o.placeId.trim()
  return patch
}

/**
 * Step2 AI 응답을 이벤트 PATCH로 반영.
 * - MSW/Spring 구버전: 최상위 locationName, locationAddress, …
 * - Spring 신규: recommendedPlaces[{ name, score?, address?, … }], placeCandidates 동일 형태
 */
export function step2AiResultToUpdatePatch(result: Record<string, unknown>): EventUpdateRequest {
  const patch: EventUpdateRequest = {}

  if (typeof result.locationName === 'string' && result.locationName.trim())
    patch.locationName = result.locationName.trim()
  if (typeof result.locationAddress === 'string' && result.locationAddress.trim())
    patch.locationAddress = result.locationAddress.trim()
  if (typeof result.locationLat === 'number') patch.locationLat = result.locationLat
  if (typeof result.locationLng === 'number') patch.locationLng = result.locationLng
  if (typeof result.placeId === 'string' && result.placeId.trim())
    patch.placeId = result.placeId.trim()

  const hasPlace =
    patch.locationName != null ||
    patch.locationAddress != null ||
    patch.locationLat != null ||
    patch.placeId != null

  if (!hasPlace) {
    const lists = [result.recommendedPlaces, result.placeCandidates]
    for (const arr of lists) {
      if (!Array.isArray(arr) || arr.length === 0) continue
      const first = arr[0]
      if (first && typeof first === 'object') {
        Object.assign(patch, placeRecordToLocationPatch(first as Record<string, unknown>))
        break
      }
    }
  }

  return patch
}

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
