import { createFileRoute, Outlet } from '@tanstack/react-router'
import { z } from 'zod'

const boardSearchSchema = z.object({
  category: z.enum(['NOTICE', 'SCHEDULE', 'TEAM_BUILDING', 'QNA', 'RESOURCE']).optional(),
})

export const Route = createFileRoute('/_authed/events/$eventId/board')({
  validateSearch: boardSearchSchema,
  component: EventBoardLayout,
})

function EventBoardLayout() {
  return <Outlet />
}
