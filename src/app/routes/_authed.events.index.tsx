import { createFileRoute, Link } from '@tanstack/react-router'
import { Skeleton } from 'boneyard-js/react'
import { z } from 'zod'
import { Calendar, Plus } from 'lucide-react'
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { cn } from '@/lib/utils'
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
    <main className="container max-w-6xl py-10">
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
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
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

function EventCard({ event: ev }: { event: Event }) {
  const dDay = daysUntil(ev.recruitDeadline)
  const isRecruiting = ev.status === 'RECRUITING'
  const status = ev.status && EVENT_STATUS_LABELS[ev.status]

  const bits: string[] = []
  bits.push(ev.type === 'INTER_CLUB' ? '연합' : '교내')
  if (ev.category) bits.push(EVENT_CATEGORY_LABELS[ev.category])
  if (status) bits.push(status.label)
  const metaPrimary = bits.join(' · ')

  const extras: string[] = []
  if (ev.startAt) extras.push(ev.startAt.slice(0, 10))
  if (ev.locationName) extras.push(ev.locationName)
  if (ev.maxParticipants) extras.push(`최대 ${ev.maxParticipants}명`)
  const metaSecondary = extras.length > 0 ? extras.join(' · ') : null

  const summary = (ev.description ?? ev.proposalMessage)?.trim()

  const recruitLine =
    isRecruiting && dDay !== null ? formatRecruitDdLabel(dDay) : null

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: String(ev.id) }}
      className="group block h-full min-h-[160px] rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="relative flex h-full flex-col border-border/90 transition-colors group-hover:border-primary/35 group-hover:bg-muted/[0.25]">
        {recruitLine && (
          <div className="absolute right-4 top-4 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">모집</p>
            <p className="text-sm font-semibold tabular-nums">{recruitLine}</p>
          </div>
        )}
        <CardHeader className={cn('flex-1 space-y-2 pb-2 pr-24', !recruitLine && 'pr-5')}>
          <CardTitle className="text-base leading-snug transition-colors group-hover:text-primary">
            {ev.title}
          </CardTitle>
          <p className="text-[12px] leading-relaxed text-muted-foreground">{metaPrimary}</p>
          {summary ? (
            <CardDescription className="line-clamp-2 text-[13px] leading-relaxed">{summary}</CardDescription>
          ) : null}
        </CardHeader>
        {metaSecondary && (
          <CardFooter className="border-t border-border/80 bg-muted/[0.2] px-5 py-3 text-[12px] text-muted-foreground">
            {metaSecondary}
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}
