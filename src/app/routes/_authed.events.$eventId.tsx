import { createFileRoute, Outlet } from '@tanstack/react-router'
import { EventChatShell } from '@/features/chat/event-chat-shell'

/**
 * 행사 하위(상세·보드·위저드) 공통 레이아웃.
 * 채팅은 별도 깊이(/chat)가 아니라 오른쪽 패널(좁은 화면에서는 하단)으로 둡니다.
 */
export const Route = createFileRoute('/_authed/events/$eventId')({
  component: EventIdLayout,
})

function EventIdLayout() {
  const { eventId } = Route.useParams()
  const id = Number(eventId)
  const chatOk = Number.isFinite(id) && id > 0

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col lg:h-[calc(100dvh-3rem)] lg:flex-row">
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
      {chatOk && (
        <aside
          id="event-chat-panel"
          aria-label="행사 채팅"
          className="flex max-h-[min(420px,52vh)] min-h-[260px] w-full shrink-0 flex-col border-t border-border bg-background lg:max-h-none lg:h-full lg:w-[380px] lg:shrink-0 lg:border-l lg:border-t-0"
        >
          <EventChatShell eventId={id} />
        </aside>
      )}
    </div>
  )
}
