import { cn } from '@/lib/utils'

/**
 * Crew Logomark — 두 개의 호 + 별 (다중 노출/연결 메타포).
 * 단일 색 currentColor → 헤더/하이라이트/푸터 어디서든 톤 자동 매칭.
 */
export function CrewLogoMark({
  className,
  size = 24,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      className={cn('text-primary', className)}
      aria-hidden
    >
      {/* 외곽 호 */}
      <path
        d="M21 12a9 9 0 1 1-9-9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* 내부 호 (offset, 약간 회전) */}
      <path
        d="M17 12a5 5 0 1 1-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* 액센트 점 */}
      <circle cx="20" cy="6" r="2" fill="currentColor" />
    </svg>
  )
}

export function CrewLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <CrewLogoMark size={22} />
      <span className="font-bold tracking-tight">Crew</span>
    </span>
  )
}
