import { Bell, CheckCheck } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  toast,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from './queries'
import type { Notification } from '@/shared/api/types'

export function NotificationBell() {
  const { data: notifications } = useNotifications(false)
  const markRead = useMarkNotificationRead()
  const readAll = useMarkAllNotificationsRead()

  const unread = notifications?.filter((n) => !n.isRead) ?? []
  const recent = (notifications ?? []).slice(0, 8)

  const handleReadAll = async () => {
    try {
      await readAll.mutateAsync()
      toast.success('전체 읽음 처리 완료')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '실패')
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="알림" className="relative">
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <p className="text-sm font-semibold">알림</p>
          {unread.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={handleReadAll}
              disabled={readAll.isPending}
            >
              <CheckCheck className="h-3 w-3" /> 전체 읽음
            </Button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            받은 알림이 없습니다.
          </p>
        ) : (
          <ul className="max-h-96 overflow-auto divide-y">
            {recent.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n.id!)
                }}
              />
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification
  onClick: () => void
}) {
  const targetTo = resolveTarget(notification)
  const Inner = (
    <div
      className={cn(
        'block px-4 py-3 transition-colors hover:bg-accent',
        !notification.isRead && 'bg-primary/5',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{notification.title}</p>
        {!notification.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
        {notification.message}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {notification.createdAt?.slice(0, 16).replace('T', ' ')}
      </p>
    </div>
  )

  if (targetTo) {
    return (
      <li>
        <Link to={targetTo.to} params={targetTo.params as never} onClick={onClick}>
          {Inner}
        </Link>
      </li>
    )
  }
  return (
    <li role="button" onClick={onClick}>
      {Inner}
    </li>
  )
}

type Target =
  | { to: '/events/$eventId'; params: { eventId: string } }
  | { to: '/clubs/$clubId'; params: { clubId: string } }
  | { to: '/events/$eventId/chat'; params: { eventId: string } }

function resolveTarget(n: Notification): Target | null {
  if (!n.targetType || !n.targetId) return null
  if (n.targetType === 'EVENT')
    return { to: '/events/$eventId', params: { eventId: String(n.targetId) } }
  if (n.targetType === 'CLUB')
    return { to: '/clubs/$clubId', params: { clubId: String(n.targetId) } }
  // CHAT_ROOM 은 chat 직접 라우팅 데이터 부족 → 없는 것으로 처리
  return null
}
