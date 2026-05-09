import { createFileRoute, Outlet } from '@tanstack/react-router'

/** /clubs 하위 라우트(목록/상세/새 글/보드)들의 공용 layout. Outlet만 렌더. */
export const Route = createFileRoute('/_authed/clubs')({
  component: () => <Outlet />,
})
