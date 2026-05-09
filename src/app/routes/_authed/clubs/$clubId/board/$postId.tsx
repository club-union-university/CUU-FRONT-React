import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { BoardPostDetail } from '@/features/post/board-post-detail'

export const Route = createFileRoute('/_authed/clubs/$clubId/board/$postId')({
  component: ClubBoardPostPage,
})

function ClubBoardPostPage() {
  const { clubId, postId } = Route.useParams()
  const navigate = Route.useNavigate()
  const targetId = Number(clubId)
  const pid = Number(postId)

  return (
    <BoardPostDetail
      boardType="CLUB"
      targetId={targetId}
      postId={pid}
      readOnly
      backLink={
        <Link
          to="/clubs/$clubId/board"
          params={{ clubId: String(clubId) }}
          className="inline-flex items-center gap-1.5 text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          게시판 목록
        </Link>
      }
      onDeleted={() =>
        navigate({ to: '/clubs/$clubId/board', params: { clubId: String(clubId) } })
      }
    />
  )
}
