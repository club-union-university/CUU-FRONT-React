import { createFileRoute } from '@tanstack/react-router'
import { Megaphone } from 'lucide-react'
import { useEvent } from '@/features/event'
import { PostBoard } from '@/features/post'

export const Route = createFileRoute('/_authed/events/$eventId/board/')({
  component: EventBoardPage,
})

function EventBoardPage() {
  const { eventId } = Route.useParams()
  const id = Number(eventId)
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: event } = useEvent(id)

  return (
    <main className="container max-w-4xl py-10">
      <header className="mb-6 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">{event?.title} · 게시판</h1>
      </header>
      <PostBoard
        boardType="EVENT"
        targetId={id}
        category={search.category}
        onCategoryChange={(c) => navigate({ search: { category: c } })}
      />
    </main>
  )
}
