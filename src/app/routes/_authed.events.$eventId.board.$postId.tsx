import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { BoardPostDetail } from '@/features/post/board-post-detail'

export const Route = createFileRoute('/_authed/events/$eventId/board/$postId')({
  component: EventBoardPostPage,
})

function EventBoardPostPage() {
  const { eventId, postId } = Route.useParams()
  const navigate = Route.useNavigate()
  const targetId = Number(eventId)
  const pid = Number(postId)

  return (
    <BoardPostDetail
      boardType="EVENT"
      targetId={targetId}
      postId={pid}
      readOnly={false}
      backLink={
        <Link
          to="/events/$eventId/board"
          params={{ eventId: String(eventId) }}
          className="inline-flex items-center gap-1.5 text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          게시판 목록
        </Link>
      }
      onDeleted={() =>
        navigate({ to: '/events/$eventId/board', params: { eventId: String(eventId) } })
      }
    />
  )
}
