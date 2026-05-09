import { createFileRoute, Link } from '@tanstack/react-router'
import { Skeleton } from 'boneyard-js/react'
import { z } from 'zod'
import { Calendar, Plus } from 'lucide-react'
import {
  Button,
  Card,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import {
  daysUntil,
  EVENT_CATEGORY_LABELS,
  EVENT_STATUS_LABELS,
  useEvents,
} from '@/features/event'
import { useAuthStore } from '@/features/auth'
import type { Event, EventType } from '@/shared/api/types'

const searchSchema = z.object({
  type: z.enum(['INTRA_CLUB', 'INTER_CLUB']).optional(),
  status: z.enum(['DRAFT', 'PARTNER_REVIEW', 'APPROVED', 'REJECTED', 'RECRUITING', 'CLOSED']).optional(),
})

export const Route = createFileRoute('/_authed/events/')({
  validateSearch: searchSchema,
  component: EventsListPage,
})

function EventsListPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: events, isLoading } = useEvents({ type: search.type, status: search.status })

  return (
    <main className="container max-w-5xl py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">행사</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">교내·연합 타입별로 필터해 볼 수 있습니다.</p>
        </div>
        {user?.role === 'PRESIDENT' && (
          <Button asChild>
            <Link to="/events/new">
              <Plus className="mr-1 h-4 w-4" /> 행사 만들기
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select
          value={search.type ?? 'ALL'}
          onValueChange={(v) =>
            navigate({ search: (s) => ({ ...s, type: v === 'ALL' ? undefined : (v as EventType) }) })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 타입</SelectItem>
            <SelectItem value="INTRA_CLUB">교내</SelectItem>
            <SelectItem value="INTER_CLUB">연합</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Skeleton name="events-list" loading={isLoading}>
        {events &&
          (events.length === 0 ? (
            <Card>
              <EmptyState
                icon={Calendar}
                title="아직 등록된 행사가 없습니다"
                description={
                  user?.role === 'PRESIDENT'
                    ? '새 행사 만들기로 초안을 올려 보세요. 세부 항목은 위저드에서 다듬을 수 있습니다.'
                    : '곧 행사들이 등록될 예정입니다.'
                }
                action={
                  user?.role === 'PRESIDENT' && (
                    <Button asChild>
                      <Link to="/events/new">
                        <Plus className="mr-1 h-4 w-4" /> 행사 만들기
                      </Link>
                    </Button>
                  )
                }
              />
            </Card>
          ) : (
            <div className="overflow-hidden rounded-md border bg-card">
              <ul className="divide-y divide-border">
                {events.map((ev) => (
                  <EventRow key={ev.id} event={ev} />
                ))}
              </ul>
            </div>
          ))}
      </Skeleton>
    </main>
  )
}

function formatRecruitDdLabel(days: number) {
  if (days === 0) return '오늘 마감'
  if (days > 0) return `마감 D-${days}`
  return `마감 D+${-days}`
}

function EventRow({ event: ev }: { event: Event }) {
  const dDay = daysUntil(ev.recruitDeadline)
  const isRecruiting = ev.status === 'RECRUITING'
  const status = ev.status && EVENT_STATUS_LABELS[ev.status]

  const bits: string[] = []
  bits.push(ev.type === 'INTER_CLUB' ? '연합' : '교내')
  if (ev.category) bits.push(EVENT_CATEGORY_LABELS[ev.category])
  if (status) bits.push(status.label)
  const metaPrimary = bits.join(' · ')

  const extras: string[] = []
  if (ev.locationName) extras.push(ev.locationName)
  if (ev.maxParticipants) extras.push(`최대 ${ev.maxParticipants}명`)
  if (ev.startAt) extras.push(ev.startAt.slice(0, 10))
  const metaSecondary = extras.length > 0 ? extras.join(' · ') : null

  const summary = (ev.description ?? ev.proposalMessage)?.trim()

  const recruitLine =
    isRecruiting && dDay !== null ? formatRecruitDdLabel(dDay) : null

  return (
    <li>
      <Link
        to="/events/$eventId"
        params={{ eventId: String(ev.id) }}
        className="group block px-4 py-3.5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:py-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium leading-snug text-foreground group-hover:underline group-hover:decoration-muted-foreground/60">
              {ev.title}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">{metaPrimary}</p>
            {summary && (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>
            )}
            {metaSecondary && (
              <p className="text-xs text-muted-foreground/90">{metaSecondary}</p>
            )}
          </div>
          {recruitLine && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">모집</p>
              <p className="text-sm font-medium tabular-nums text-foreground">{recruitLine}</p>
            </div>
          )}
        </div>
      </Link>
    </li>
  )
}
