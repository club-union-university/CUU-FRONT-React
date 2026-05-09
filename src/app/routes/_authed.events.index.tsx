import { createFileRoute, Link } from '@tanstack/react-router'
import { Skeleton } from 'boneyard-js/react'
import { z } from 'zod'
import { Calendar, MapPin, Plus, Users } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import {
  daysUntil,
  EVENT_CATEGORY_COLORS,
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
          <h1 className="text-3xl font-bold tracking-tight">행사</h1>
          <p className="mt-1 text-sm text-muted-foreground">교내·연합 행사를 한 곳에서 봅니다.</p>
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
                    ? '자연어 한 줄로 행사를 만들어 보세요. AI가 정제해 줍니다.'
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

function EventCard({ event: ev }: { event: Event }) {
  const color = ev.category && EVENT_CATEGORY_COLORS[ev.category]
  const dDay = daysUntil(ev.recruitDeadline)
  const isRecruiting = ev.status === 'RECRUITING'
  const isUrgent = isRecruiting && dDay !== null && dDay >= 0 && dDay <= 7
  const status = ev.status && EVENT_STATUS_LABELS[ev.status]

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: String(ev.id) }}
      className="group block"
    >
      <Card className="relative h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        {color && <div className={cn('absolute inset-y-0 left-0 w-1', color.bar)} />}
        <CardHeader className="pl-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {ev.category && color && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      color.bg,
                      color.text,
                    )}
                  >
                    {EVENT_CATEGORY_LABELS[ev.category]}
                  </span>
                )}
                <Badge variant="secondary" className="font-normal">
                  {ev.type === 'INTER_CLUB' ? '연합' : '교내'}
                </Badge>
                {status && (
                  <Badge variant={status.variant} className="font-normal">
                    {status.label}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-primary">
                {ev.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {ev.description ?? ev.proposalMessage ?? '설명 없음'}
              </CardDescription>
            </div>
            {dDay !== null && isRecruiting && (
              <DDayBadge days={dDay} urgent={isUrgent} />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 pl-7 pt-0 text-xs text-muted-foreground">
          {ev.locationName && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{ev.locationName}</span>
            </div>
          )}
          {ev.maxParticipants && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>최대 {ev.maxParticipants}명</span>
            </div>
          )}
          {ev.startAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{ev.startAt.slice(0, 10)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function DDayBadge({ days, urgent }: { days: number; urgent: boolean }) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center rounded-md px-2.5 py-1 text-center',
        urgent ? 'bg-red-50 text-red-700' : 'bg-muted text-foreground',
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
        모집 마감
      </span>
      <span className="text-base font-bold tabular-nums">
        {days === 0 ? 'D-day' : days > 0 ? `D-${days}` : `D+${-days}`}
      </span>
    </div>
  )
}
