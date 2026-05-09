import { createFileRoute, Link } from '@tanstack/react-router'
import { Skeleton } from 'boneyard-js/react'
import { Plus } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import {
  CLUB_CATEGORY_COLORS,
  CLUB_CATEGORY_LABELS,
  CLUB_STATUS_LABELS,
  useClub,
} from '@/features/club'
import { useAuthStore } from '@/features/auth'

export const Route = createFileRoute('/_authed/clubs/$clubId/')({
  component: ClubDetailPage,
})

function ClubDetailPage() {
  const { clubId } = Route.useParams()
  const id = Number(clubId)
  const { data: club, isLoading } = useClub(id)
  const user = useAuthStore((s) => s.user)
  const isPresident = user?.role === 'PRESIDENT' && club?.presidentUserId === user?.id
  const color = club?.category && CLUB_CATEGORY_COLORS[club.category]

  return (
    <Skeleton name="club-detail" loading={isLoading}>
      {!club ? (
        <main className="container max-w-4xl py-10">
          <p className="text-sm text-muted-foreground">동아리를 찾을 수 없습니다.</p>
        </main>
      ) : (
        <main className="container max-w-4xl py-10">
          {color && (
            <div className={cn('mb-6 h-1.5 w-24 rounded-full', color.bar)} aria-hidden />
          )}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {club.category && color && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      color.bg,
                      color.text,
                    )}
                  >
                    {CLUB_CATEGORY_LABELS[club.category]}
                  </span>
                )}
                {club.status && (
                  <Badge variant={CLUB_STATUS_LABELS[club.status].variant}>
                    {CLUB_STATUS_LABELS[club.status].label}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{club.name}</h1>
            </div>
            <div className="flex gap-2">
              {club.status === 'APPROVED' && (
                <Button variant="outline" asChild>
                  <Link to="/clubs/$clubId/board" params={{ clubId: String(club.id) }}>
                    동아리 게시판
                  </Link>
                </Button>
              )}
              {isPresident && club.status === 'APPROVED' && (
                <Button asChild>
                  <Link to="/events/new" search={{ hostClubId: club.id }}>
                    <Plus className="mr-1 h-4 w-4" /> 행사 만들기
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">소개</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                {club.description ?? '소개가 등록되지 않았습니다.'}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">정보</CardTitle>
                <CardDescription>가입은 회장이 발급한 초대 코드로 가능합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {isPresident && club.inviteCode && (
                  <div>
                    <span className="text-muted-foreground">초대 코드: </span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      {club.inviteCode}
                    </code>
                  </div>
                )}
                <div className="text-muted-foreground">
                  승인 일시: {club.approvedAt ?? '아직 승인되지 않음'}
                </div>
                {club.status === 'REJECTED' && club.rejectReason && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700">
                    거절 사유: {club.rejectReason}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      )}
    </Skeleton>
  )
}
