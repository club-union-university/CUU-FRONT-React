import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { BoardPostDetail } from '@/features/post/board-post-detail'

export const Route = createFileRoute('/_authed/schools/$schoolId/board/$postId')({
  component: SchoolBoardPostPage,
})

function SchoolBoardPostPage() {
  const { schoolId, postId } = Route.useParams()
  const navigate = Route.useNavigate()
  const targetId = Number(schoolId)
  const pid = Number(postId)

  return (
    <BoardPostDetail
      boardType="SCHOOL"
      targetId={targetId}
      postId={pid}
      readOnly
      backLink={
        <Link
          to="/schools/$schoolId/board"
          params={{ schoolId: String(schoolId) }}
          className="inline-flex items-center gap-1.5 text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          게시판 목록
        </Link>
      }
      onDeleted={() =>
        navigate({ to: '/schools/$schoolId/board', params: { schoolId: String(schoolId) } })
      }
    />
  )
}
