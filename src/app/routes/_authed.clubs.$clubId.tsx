import { createFileRoute, Outlet } from '@tanstack/react-router'

/** /clubs/$clubId 하위(상세/보드)의 layout. Outlet만 렌더. */
export const Route = createFileRoute('/_authed/clubs/$clubId')({
  component: () => <Outlet />,
})
