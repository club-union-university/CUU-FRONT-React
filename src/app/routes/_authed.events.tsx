import { createFileRoute, Outlet } from '@tanstack/react-router'

/** /events 하위 라우트들의 공용 layout. Outlet만 렌더. */
export const Route = createFileRoute('/_authed/events')({
  component: () => <Outlet />,
})
