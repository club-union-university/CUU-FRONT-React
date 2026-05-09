import { createFileRoute, Link } from '@tanstack/react-router'
import { Building2, GraduationCap, Megaphone, Check, X, Calendar, MapPin, Users } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EventDetailPageSkeleton,
  ParticipantListSkeleton,
  toast,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import {
  daysUntil,
  EVENT_CATEGORY_COLORS,
  EVENT_CATEGORY_LABELS,
  EVENT_STATUS_LABELS,
  useEvent,
  useEventParticipants,
  useApplyToEvent,
  useApproveParticipant,
  useRejectParticipant,
} from '@/features/event'
import { useClub } from '@/features/club'
import { useAuthStore } from '@/features/auth'
import type { Event, ParticipantStatus } from '@/shared/api/types'

export const Route = createFileRoute('/_authed/events/$eventId/')({
  component: EventDetailPage,
})

function EventDetailPage() {
  const { eventId } = Route.useParams()
  const id = Number(eventId)
  const { data: event, isLoading } = useEvent(id)

  if (isLoading) {
    return <EventDetailPageSkeleton />
  }

  if (!event) {
    return (
      <main className="container py-10">
        <p className="text-sm text-muted-foreground">행사를 찾을 수 없습니다.</p>
      </main>
    )
  }

  return <EventDetailContent event={event} eventId={eventId} />
}

function EventDetailContent({ event, eventId }: { event: Event; eventId: string }) {
  const id = Number(eventId)
  const host = useClub(event.hostClubId ?? 0)
  const partner = useClub(event.partnerClubId ?? 0)
  const user = useAuthStore((s) => s.user)

  const isInter = event.type === 'INTER_CLUB'
  const isHostPresident =
    user?.role === 'PRESIDENT' &&
    (host.data?.presidentUserId === user?.id || partner.data?.presidentUserId === user?.id)

  const color = event.category && EVENT_CATEGORY_COLORS[event.category]
  const dDay = daysUntil(event.recruitDeadline)
  const status = event.status && EVENT_STATUS_LABELS[event.status]

  return (
    <main className="container max-w-5xl py-10">
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {event.category && color && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    color.bg,
                    color.text,
                  )}
                >
                  {EVENT_CATEGORY_LABELS[event.category]}
                </span>
              )}
              <Badge variant="secondary">{isInter ? '연합 행사' : '교내 행사'}</Badge>
              {status && <Badge variant={status.variant}>{status.label}</Badge>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {event.startAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {event.startAt.slice(0, 10)}
                </span>
              )}
              {event.locationName && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {event.locationName}
                </span>
              )}
              {event.maxParticipants && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> 최대 {event.maxParticipants}명
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {dDay !== null && event.status === 'RECRUITING' && (
              <DDayCard days={dDay} />
            )}
            <div className="flex flex-col gap-2">
              {isHostPresident && event.status === 'DRAFT' && (
                <Button asChild>
                  <Link to="/events/$eventId/wizard" params={{ eventId }}>
                    위저드 계속하기
                  </Link>
                </Button>
              )}
              {!isHostPresident && event.status === 'RECRUITING' && <ApplyButton eventId={id} />}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">설명</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="whitespace-pre-wrap text-muted-foreground">
              {event.description ?? event.proposalMessage ?? '설명 없음'}
            </p>
            {event.format && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">형태:</span> {event.format}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">다중 노출</CardTitle>
            <CardDescription>{isInter ? '5곳' : '3곳'}에 자동 노출됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ExposureItem
              icon={<Megaphone className="h-4 w-4" />}
              label="행사 게시판"
              to="/events/$eventId/board"
              params={{ eventId }}
            />
            <ExposureItem
              icon={<Building2 className="h-4 w-4" />}
              label={`동아리 게시판 (${host.data?.name ?? '주최'})`}
              to="/clubs/$clubId/board"
              params={{ clubId: String(event.hostClubId) }}
            />
            {isInter && partner.data && (
              <ExposureItem
                icon={<Building2 className="h-4 w-4" />}
                label={`동아리 게시판 (${partner.data.name})`}
                to="/clubs/$clubId/board"
                params={{ clubId: String(event.partnerClubId) }}
              />
            )}
            {host.data?.schoolId && (
              <ExposureItem
                icon={<GraduationCap className="h-4 w-4" />}
                label={`학교 게시판 (학교 #${host.data.schoolId})`}
                to="/schools/$schoolId/board"
                params={{ schoolId: String(host.data.schoolId) }}
              />
            )}
            {isInter && partner.data?.schoolId && (
              <ExposureItem
                icon={<GraduationCap className="h-4 w-4" />}
                label={`학교 게시판 (학교 #${partner.data.schoolId})`}
                to="/schools/$schoolId/board"
                params={{ schoolId: String(partner.data.schoolId) }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {isHostPresident && <ParticipantsSection eventId={id} />}
    </main>
  )
}

function DDayCard({ days }: { days: number }) {
  const urgent = days >= 0 && days <= 7
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center rounded-lg border px-4 py-2 text-center',
        urgent ? 'border-red-200 bg-red-50 text-red-700' : 'border-border bg-muted',
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
        모집 마감
      </span>
      <span className="text-2xl font-bold tabular-nums">
        {days === 0 ? 'D-day' : days > 0 ? `D-${days}` : `D+${-days}`}
      </span>
    </div>
  )
}

function ApplyButton({ eventId }: { eventId: number }) {
  const apply = useApplyToEvent(eventId)
  const handleApply = async () => {
    try {
      await apply.mutateAsync()
      toast.success('신청 완료. 호스트 검토를 기다립니다.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '신청 실패')
    }
  }
  return (
    <Button onClick={handleApply} disabled={apply.isPending}>
      {apply.isPending ? '신청 중…' : '참여 신청'}
    </Button>
  )
}

const participantStatusLabel: Record<
  ParticipantStatus,
  { label: string; variant: 'default' | 'warning' | 'destructive' | 'secondary' }
> = {
  PENDING: { label: '대기', variant: 'warning' },
  APPROVED: { label: '승인됨', variant: 'default' },
  REJECTED: { label: '거절됨', variant: 'destructive' },
}

function ParticipantsSection({ eventId }: { eventId: number }) {
  const { data: participants, isLoading } = useEventParticipants(eventId)
  const approve = useApproveParticipant(eventId)
  const reject = useRejectParticipant(eventId)

  const pending = participants?.filter((p) => p.status === 'PENDING') ?? []
  const approved = participants?.filter((p) => p.status === 'APPROVED') ?? []

  const handleApprove = async (id: number) => {
    try {
      await approve.mutateAsync(id)
      toast.success('승인 완료')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '승인 실패')
    }
  }
  const handleReject = async (id: number) => {
    try {
      await reject.mutateAsync(id)
      toast.success('거절 완료')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '거절 실패')
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">참여자</CardTitle>
          <span className="text-sm text-muted-foreground">
            승인 {approved.length} · 대기 {pending.length}
          </span>
        </div>
        <CardDescription>호스트 회장만 볼 수 있습니다.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ParticipantListSkeleton rows={5} />
        ) : !participants ? null : participants.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            아직 신청자가 없습니다.
          </p>
        ) : (
          <ul className="divide-y">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <Avatar seed={p.userId} name={`User ${p.userId}`} size={36} />
                  <div>
                    <p className="text-sm font-medium">사용자 #{p.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      신청 {p.appliedAt?.slice(0, 10) ?? '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.status && (
                    <Badge variant={participantStatusLabel[p.status].variant}>
                      {participantStatusLabel[p.status].label}
                    </Badge>
                  )}
                  {p.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(p.id!)}
                        disabled={reject.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(p.id!)}
                        disabled={approve.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function ExposureItem({
  icon,
  label,
  to,
  params,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  to?: '/events/$eventId/board' | '/clubs/$clubId/board' | '/schools/$schoolId/board'
  params?: Record<string, string>
  disabled?: boolean
}) {
  if (disabled || !to) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-muted-foreground">
        {icon}
        <span className="flex-1">{label}</span>
        <span className="text-xs opacity-60">read-only</span>
      </div>
    )
  }
  return (
    <Link
      to={to}
      params={params as never}
      className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 transition-colors hover:bg-accent"
    >
      {icon}
      <span className="flex-1">{label}</span>
    </Link>
  )
}
