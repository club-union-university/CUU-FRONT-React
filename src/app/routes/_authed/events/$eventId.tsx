import { createFileRoute, Outlet } from '@tanstack/react-router'

/** 행사 하위(상세·보드·위저드) 공통 레이아웃 */
export const Route = createFileRoute('/_authed/events/$eventId')({
  component: EventIdLayout,
})

function EventIdLayout() {
  return (
    <div className="min-h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-3rem)]">
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
