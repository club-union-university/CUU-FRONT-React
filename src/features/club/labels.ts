import type { ClubCategory, ClubStatus } from '@/shared/api/types'

export const CLUB_CATEGORY_LABELS: Record<ClubCategory, string> = {
  DEV: '개발',
  DESIGN: '디자인',
  STARTUP: '창업',
  ART: '예술',
  SPORTS: '스포츠',
}

/**
 * 카테고리별 색상 토큰. 카드 좌측 띠/배지/소프트 배경에서 일관 사용.
 * 명도 단계는 _50/_500/_700 패턴으로 라이트/다크 양쪽 자연스러움 유지.
 */
export const CLUB_CATEGORY_COLORS: Record<
  ClubCategory,
  { bar: string; bg: string; text: string; ring: string }
> = {
  DEV: { bar: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200' },
  DESIGN: {
    bar: 'bg-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    ring: 'ring-pink-200',
  },
  STARTUP: {
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
  },
  ART: {
    bar: 'bg-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    ring: 'ring-purple-200',
  },
  SPORTS: {
    bar: 'bg-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-200',
  },
}

export const CLUB_STATUS_LABELS: Record<
  ClubStatus,
  { label: string; variant: 'default' | 'warning' | 'destructive' }
> = {
  PENDING: { label: '승인 대기', variant: 'warning' },
  APPROVED: { label: '승인됨', variant: 'default' },
  REJECTED: { label: '거절됨', variant: 'destructive' },
}
