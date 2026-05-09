import { createFileRoute, Link } from '@tanstack/react-router'
import { Skeleton } from 'boneyard-js/react'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { useEvents } from '@/features/event'
import { useAuthStore } from '@/features/auth'
import type { EventStatus, EventType } from '@/shared/api/types'

const searchSchema = z.object({
  type: z.enum(['INTRA_CLUB', 'INTER_CLUB']).optional(),
  status: z.enum(['DRAFT', 'PARTNER_REVIEW', 'APPROVED', 'REJECTED', 'RECRUITING', 'CLOSED']).optional(),
})

export const Route = createFileRoute('/_authed/events/')({
  validateSearch: searchSchema,
  component: EventsListPage,
})

const statusLabel: Record<EventStatus, { label: string; variant: 'default' | 'warning' | 'destructive' | 'secondary' | 'success' }> = {
  DRAFT: { label: '초안', variant: 'secondary' },
  PARTNER_REVIEW: { label: '파트너 검토', variant: 'warning' },
  APPROVED: { label: '승인됨', variant: 'default' },
  REJECTED: { label: '거절됨', variant: 'destructive' },
  RECRUITING: { label: '모집 중', variant: 'success' },
  CLOSED: { label: '마감', variant: 'secondary' },
}

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
        {!events?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              아직 등록된 행사가 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((ev) => (
            <Link
              key={ev.id}
              to="/events/$eventId"
              params={{ eventId: String(ev.id) }}
              className="block transition-transform hover:-translate-y-0.5"
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{ev.title}</CardTitle>
                    {ev.status && (
                      <Badge variant={statusLabel[ev.status].variant}>
                        {statusLabel[ev.status].label}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {ev.description ?? ev.proposalMessage ?? '설명 없음'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Badge variant="secondary">
                    {ev.type === 'INTER_CLUB' ? '연합' : '교내'}
                  </Badge>
                  {ev.category && <Badge variant="outline">{ev.category}</Badge>}
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        )}
      </Skeleton>
    </main>
  )
}
