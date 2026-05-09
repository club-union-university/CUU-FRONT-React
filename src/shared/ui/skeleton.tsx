import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...rest}
    />
  )
}

/** 게시판 글 목록 */
export function PostBoardListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-stretch gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-[40%] max-w-[200px]" />
            <Skeleton className="h-4 w-[75%] max-w-md" />
          </div>
          <div className="flex shrink-0 items-center border-l border-border/80 pl-2 sm:pl-3">
            <Skeleton className="h-5 w-5 shrink-0 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** 행사·동아리 카드 그리드 */
export function CardGridSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-md border border-border bg-card p-5 shadow-xs">
          <Skeleton className="mb-3 h-5 w-[55%]" />
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="h-3 w-[40%]" />
        </div>
      ))}
    </div>
  )
}

/** 게시글 단건 상세 */
export function BoardPostDetailSkeleton() {
  return (
    <CardSkeleton>
      <div className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-[85%] max-w-xl" />
        <Skeleton className="h-8 w-[60%] max-w-lg" />
      </div>
      <div className="space-y-3 pt-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="mt-8 h-4 w-24" />
        <Skeleton className="h-10 w-full max-w-xl" />
      </div>
    </CardSkeleton>
  )
}

function CardSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-xs">{children}</div>
  )
}

/** 동아리 상세 페이지 */
export function ClubDetailPageSkeleton() {
  return (
    <main className="container max-w-4xl py-10">
      <Skeleton className="mb-6 h-1.5 w-24 rounded-full" />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-64 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-md border border-border bg-card p-6 lg:col-span-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="space-y-3 rounded-md border border-border bg-card p-6">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </main>
  )
}

/** 행사 상세 헤더 + 2열 본문 */
export function EventDetailPageSkeleton() {
  return (
    <main className="container max-w-5xl py-10">
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-[min(100%,28rem)]" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-20 w-24 shrink-0 rounded-lg" />
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 rounded-md border border-border bg-card p-6 lg:col-span-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="space-y-4 rounded-md border border-border bg-card p-6">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </main>
  )
}

/** 참여자 리스트(카드 내부) */
export function ParticipantListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** 테이블 뼈대(어드민 등) */
export function TableSkeleton({
  cols = 7,
  rows = 6,
}: {
  cols?: number
  rows?: number
}) {
  return (
    <div className="overflow-x-auto p-4">
      <div className="mb-4 flex gap-4 border-b border-border pb-3">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className="h-4 min-w-[4rem] flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="mb-4 flex gap-4">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className="h-9 min-w-[4rem] flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
