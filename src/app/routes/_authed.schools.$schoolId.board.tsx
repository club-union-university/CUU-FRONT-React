import { createFileRoute, Outlet } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  category: z.enum(['NOTICE', 'SCHEDULE', 'TEAM_BUILDING', 'QNA', 'RESOURCE']).optional(),
})

export const Route = createFileRoute('/_authed/schools/$schoolId/board')({
  validateSearch: searchSchema,
  component: SchoolBoardLayout,
})

function SchoolBoardLayout() {
  return <Outlet />
}
