import { createFileRoute, Outlet } from '@tanstack/react-router'

/** /events/$eventId 하위(상세/보드/위저드)의 layout. Outlet만 렌더. */
export const Route = createFileRoute('/_authed/events/$eventId')({
  component: () => <Outlet />,
})
