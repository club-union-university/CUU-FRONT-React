import { createFileRoute, Link } from '@tanstack/react-router'
import { Building2, GraduationCap, Megaphone } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui'
import { useEvent } from '@/features/event'
import { useClub } from '@/features/club'
import { useAuthStore } from '@/features/auth'
import type { EventStatus } from '@/shared/api/types'

export const Route = createFileRoute('/_authed/events/$eventId')({
  component: EventDetailPage,
})

const statusVariant: Record<EventStatus, 'default' | 'warning' | 'destructive' | 'secondary' | 'success'> = {
  DRAFT: 'secondary',
  PARTNER_REVIEW: 'warning',
  APPROVED: 'default',
  REJECTED: 'destructive',
  RECRUITING: 'success',
  CLOSED: 'secondary',
}

function EventDetailPage() {
  const { eventId } = Route.useParams()
  const id = Number(eventId)
  const { data: event, isLoading } = useEvent(id)
  const host = useClub(event?.hostClubId ?? 0)
  const partner = useClub(event?.partnerClubId ?? 0)
  const user = useAuthStore((s) => s.user)

  if (isLoading || !event) {
    return <p className="container py-10 text-sm text-muted-foreground">불러오는 중…</p>
  }

  const isInter = event.type === 'INTER_CLUB'
  const isHostPresident =
    user?.role === 'PRESIDENT' && event.hostClubId === host.data?.id && host.data?.presidentUserId === user?.id

  return (
    <main className="container max-w-5xl py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{isInter ? '연합 행사' : '교내 행사'}</Badge>
            {event.status && (
              <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
            )}
            {event.category && <Badge variant="outline">{event.category}</Badge>}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{event.title}</h1>
        </div>
        {isHostPresident && event.status === 'DRAFT' && (
          <Button asChild>
            <Link to="/events/$eventId/wizard" params={{ eventId }}>
              위저드 계속하기
            </Link>
          </Button>
        )}
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
            {event.locationName && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">장소:</span> {event.locationName}
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
              to="/clubs/$clubId"
              params={{ clubId: String(event.hostClubId) }}
            />
            {isInter && partner.data && (
              <ExposureItem
                icon={<Building2 className="h-4 w-4" />}
                label={`동아리 게시판 (${partner.data.name})`}
                to="/clubs/$clubId"
                params={{ clubId: String(event.partnerClubId) }}
              />
            )}
            <ExposureItem
              icon={<GraduationCap className="h-4 w-4" />}
              label={`학교 게시판 (${host.data?.schoolId ? `학교 #${host.data.schoolId}` : '주최 학교'})`}
              disabled
            />
            {isInter && (
              <ExposureItem
                icon={<GraduationCap className="h-4 w-4" />}
                label={`학교 게시판 (${partner.data?.schoolId ? `학교 #${partner.data.schoolId}` : '파트너 학교'})`}
                disabled
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
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
  to?: '/events/$eventId/board' | '/clubs/$clubId'
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
