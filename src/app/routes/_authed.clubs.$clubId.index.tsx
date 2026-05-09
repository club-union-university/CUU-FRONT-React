import { createFileRoute, Link } from '@tanstack/react-router'
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
import { useClub } from '@/features/club'
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

  if (isLoading) return <p className="container py-10 text-sm text-muted-foreground">불러오는 중…</p>
  if (!club) return <p className="container py-10 text-sm text-muted-foreground">동아리를 찾을 수 없습니다.</p>

  return (
    <main className="container max-w-4xl py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{club.name}</h1>
          <div className="mt-2 flex gap-2">
            {club.category && <Badge variant="secondary">{club.category}</Badge>}
            {club.status === 'PENDING' && <Badge variant="warning">승인 대기</Badge>}
            {club.status === 'APPROVED' && <Badge>승인됨</Badge>}
            {club.status === 'REJECTED' && <Badge variant="destructive">거절됨</Badge>}
          </div>
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
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{club.inviteCode}</code>
              </div>
            )}
            <div className="text-muted-foreground">
              승인 일시: {club.approvedAt ?? '아직 승인되지 않음'}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
