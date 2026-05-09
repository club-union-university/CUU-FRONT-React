import { useEffect } from 'react'
import { EventChatPanel } from './event-chat-panel'
import { useChatRoomForEvent, useJoinChatRoom } from './queries'

export function EventChatShell({ eventId }: { eventId: number }) {
  const { data: room } = useChatRoomForEvent(eventId)
  const join = useJoinChatRoom()

  useEffect(() => {
    if (room?.id) join.mutate(room.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id])

  if (!room?.id) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/15 px-4 py-8 lg:min-h-0">
        <p className="text-center text-xs text-muted-foreground">채팅방을 불러오는 중…</p>
      </div>
    )
  }

  return <EventChatPanel chatRoomId={room.id} botPersona={room.botPersona} />
}
