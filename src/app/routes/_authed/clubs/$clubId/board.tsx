import { createFileRoute, Outlet } from '@tanstack/react-router'
import { z } from 'zod'

/** 자식 `:board.$postId`가 렌더되려면 반드시 Outlet 필요 */
const searchSchema = z.object({
  category: z.enum(['NOTICE', 'SCHEDULE', 'TEAM_BUILDING', 'QNA', 'RESOURCE']).optional(),
})

export const Route = createFileRoute('/_authed/clubs/$clubId/board')({
  validateSearch: searchSchema,
  component: ClubBoardLayout,
})

function ClubBoardLayout() {
  return <Outlet />
}
