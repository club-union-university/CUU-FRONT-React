import type { EventCategory, EventStatus } from '@/shared/api/types'

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  HACKATHON: '해커톤',
  MEETUP: '모임',
  STUDY: '스터디',
  FESTIVAL: '페스티벌',
  WORKSHOP: '워크샵',
}

export const EVENT_CATEGORY_COLORS: Record<
  EventCategory,
  { bar: string; bg: string; text: string; ring: string }
> = {
  HACKATHON: {
    bar: 'bg-indigo-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    ring: 'ring-indigo-200',
  },
  MEETUP: { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
  STUDY: {
    bar: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
  },
  FESTIVAL: {
    bar: 'bg-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    ring: 'ring-pink-200',
  },
  WORKSHOP: {
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
  },
}

export const EVENT_STATUS_LABELS: Record<
  EventStatus,
  {
    label: string
    variant: 'default' | 'warning' | 'destructive' | 'secondary' | 'success'
  }
> = {
  DRAFT: { label: '초안', variant: 'secondary' },
  PARTNER_REVIEW: { label: '파트너 검토', variant: 'warning' },
  APPROVED: { label: '승인됨', variant: 'default' },
  REJECTED: { label: '거절됨', variant: 'destructive' },
  RECRUITING: { label: '모집 중', variant: 'success' },
  CLOSED: { label: '마감', variant: 'secondary' },
}

/**
 * ISO 문자열 기준 D-day 계산. 음수면 지났다는 뜻 (이미 마감).
 * UTC가 아닌 로컬 자정 기준 정수 일수.
 */
export function daysUntil(iso?: string | null): number | null {
  if (!iso) return null
  const target = new Date(iso)
  const today = new Date()
  // 로컬 자정 기준
  const t0 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const t1 = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.round((t1 - t0) / (24 * 60 * 60 * 1000))
}
