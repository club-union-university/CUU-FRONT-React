import { createFileRoute } from '@tanstack/react-router'
import { Megaphone } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui'
import { useEvent } from '@/features/event'

export const Route = createFileRoute('/_authed/events/$eventId/board')({
  component: EventBoardPage,
})

function EventBoardPage() {
  const { eventId } = Route.useParams()
  const id = Number(eventId)
  const { data: event } = useEvent(id)

  return (
    <main className="container max-w-4xl py-10">
      <header className="mb-6 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">{event?.title} · 게시판</h1>
      </header>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {['공지', '일정', '팀빌딩', 'Q&A', '자료실'].map((cat) => (
          <Badge key={cat} variant="secondary" className="cursor-pointer whitespace-nowrap">
            {cat}
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">게시글</CardTitle>
          <CardDescription>
            P0 범위 — 게시글/댓글 CRUD UI는 P1에서 추가합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          위저드 발행 직후 자동 생성된 공지글과 카테고리가 여기에 표시됩니다.
        </CardContent>
      </Card>
    </main>
  )
}
