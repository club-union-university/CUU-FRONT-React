import { cn } from '@/lib/utils'

/**
 * CUU 로고마크 — 연결/노출 메타포 (호 + 액센트 점).
 * 단일 색 currentColor → 헤더/랜딩 등 톤 자동 매칭.
 */
export function CuuLogoMark({
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
      <path
        d="M21 12a9 9 0 1 1-9-9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M17 12a5 5 0 1 1-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="20" cy="6" r="2" fill="currentColor" />
    </svg>
  )
}

/** CUU · Club Union University */
export function CuuLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      title="Club Union University"
    >
      <CuuLogoMark size={22} />
      <span className="font-bold tracking-tight">CUU</span>
    </span>
  )
}
