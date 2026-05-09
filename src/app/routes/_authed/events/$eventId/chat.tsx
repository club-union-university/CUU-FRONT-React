import { createFileRoute, redirect } from '@tanstack/react-router'

/** 예전 깊이(/chat) 북마크 호환 — 상세+사이드 패널로 통합됨 */
export const Route = createFileRoute('/_authed/events/$eventId/chat')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/events/$eventId',
      params: { eventId: params.eventId },
      replace: true,
    })
  },
  component: () => null,
})
