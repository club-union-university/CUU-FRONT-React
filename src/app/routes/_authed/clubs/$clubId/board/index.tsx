import { createFileRoute } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'
import { Badge } from '@/shared/ui'
import { useClub } from '@/features/club'
import { PostBoard } from '@/features/post'

export const Route = createFileRoute('/_authed/clubs/$clubId/board/')({
  component: ClubBoardPage,
})

function ClubBoardPage() {
  const { clubId } = Route.useParams()
  const id = Number(clubId)
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: club } = useClub(id)

  return (
    <main className="container max-w-4xl py-10">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{club?.name ?? '동아리'} · 게시판</h1>
          <Badge variant="outline" className="ml-2">
            read-only
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          이 동아리가 주최/참여하는 행사들의 다중 노출 슬롯입니다.
        </p>
      </header>
      <PostBoard
        boardType="CLUB"
        targetId={id}
        readOnly
        category={search.category}
        onCategoryChange={(c) => navigate({ search: { category: c } })}
      />
    </main>
  )
}
