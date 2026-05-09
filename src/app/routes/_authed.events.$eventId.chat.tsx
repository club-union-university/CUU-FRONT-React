import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Bot, Send, Sparkles } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  toast,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import {
  useChatMessages,
  useChatRoomForEvent,
  useJoinChatRoom,
  useSendChatMessage,
  useTriggerBot,
} from '@/features/chat'
import { useEvent } from '@/features/event'
import { useAuthStore } from '@/features/auth'
import type { ChatMessage } from '@/shared/api/types'

export const Route = createFileRoute('/_authed/events/$eventId/chat')({
  component: EventChatPage,
})

function EventChatPage() {
  const { eventId } = Route.useParams()
  const id = Number(eventId)
  const { data: event } = useEvent(id)
  const { data: room } = useChatRoomForEvent(id)
  const join = useJoinChatRoom()
  const me = useAuthStore((s) => s.user)

  // 채팅방 자동 입장 (idempotent — 한 번 mount 시)
  useEffect(() => {
    if (room?.id) join.mutate(room.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id])

  if (!room?.id) {
    return (
      <main className="container max-w-3xl py-10">
        <p className="text-sm text-muted-foreground">채팅방 불러오는 중…</p>
      </main>
    )
  }

  return (
    <main className="container max-w-3xl py-10">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{event?.title ?? '행사'} 채팅</h1>
            {room.botPersona && (
              <Badge variant="secondary" className="gap-1">
                <Bot className="h-3 w-3" /> {room.botPersona}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            폴링 기반 (3초 주기). STOMP 도입 시 실시간 전환 예정.
          </p>
        </div>
      </header>

      <Card className="flex h-[calc(100vh-260px)] min-h-[420px] flex-col">
        <CardHeader className="flex-row items-center justify-between gap-2 border-b py-3">
          <CardTitle className="text-base">메시지</CardTitle>
          <BotTriggerButtons chatRoomId={room.id} />
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-0">
          <MessageList chatRoomId={room.id} myUserId={me?.id} />
          <MessageComposer chatRoomId={room.id} />
        </CardContent>
      </Card>
    </main>
  )
}

function MessageList({
  chatRoomId,
  myUserId,
}: {
  chatRoomId: number
  myUserId?: number
}) {
  const { data: messages = [] } = useChatMessages(chatRoomId)
  const scrollerRef = useRef<HTMLDivElement>(null)

  // 새 메시지 도착 시 자동 스크롤
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  return (
    <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
      {messages.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          아직 메시지가 없습니다. 봇 환영 메시지를 발사해 보세요.
        </p>
      ) : (
        messages.map((m) => <MessageBubble key={m.id} m={m} mine={m.senderUserId === myUserId} />)
      )}
    </div>
  )
}

function MessageBubble({ m, mine }: { m: ChatMessage; mine: boolean }) {
  const isBot = m.senderType === 'BOT'
  if (isBot) {
    return (
      <div className="flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="mb-0.5 flex items-center gap-1.5 text-xs">
            <span className="font-medium">{m.botPersona ?? 'BOT'}</span>
            <span className="text-muted-foreground">
              {m.createdAt?.slice(11, 16) ?? ''}
            </span>
          </div>
          <div className="inline-block max-w-md rounded-lg border bg-primary/5 px-3 py-2 text-sm">
            {m.content}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={cn('flex items-start gap-2', mine && 'flex-row-reverse')}>
      <Avatar seed={m.senderUserId} name={`U${m.senderUserId}`} size={32} />
      <div className={cn('flex-1', mine && 'text-right')}>
        <div
          className={cn(
            'mb-0.5 flex items-center gap-1.5 text-xs',
            mine && 'flex-row-reverse',
          )}
        >
          <span className="font-medium">{mine ? '나' : `사용자 #${m.senderUserId}`}</span>
          <span className="text-muted-foreground">{m.createdAt?.slice(11, 16) ?? ''}</span>
        </div>
        <div
          className={cn(
            'inline-block max-w-md rounded-lg px-3 py-2 text-sm',
            mine ? 'bg-primary text-primary-foreground' : 'bg-muted',
          )}
        >
          {m.content}
        </div>
      </div>
    </div>
  )
}

function MessageComposer({ chatRoomId }: { chatRoomId: number }) {
  const [text, setText] = useState('')
  const send = useSendChatMessage(chatRoomId)
  const sendingRef = useRef(false)

  /**
   * Form 패턴 + ref 가드.
   * - Enter on Input → form.onSubmit (브라우저 기본 동작)
   * - Button type="submit" 클릭 → form.onSubmit
   *   둘 다 한 경로로 모이고 Button onClick 별도 핸들러 없음 → 이벤트 중복 사라짐
   * - sendingRef로 mutateAsync 진행 중에 재진입 방지 (StrictMode 안전망)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sendingRef.current) return
    const value = text.trim()
    if (!value) return
    sendingRef.current = true
    try {
      await send.mutateAsync(value)
      setText('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '전송 실패')
    } finally {
      sendingRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
      <Input
        placeholder="메시지 입력 후 Enter"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={send.isPending}
      />
      <Button type="submit" disabled={send.isPending || !text.trim()}>
        <Send className="mr-1 h-4 w-4" /> 전송
      </Button>
    </form>
  )
}

function BotTriggerButtons({ chatRoomId }: { chatRoomId: number }) {
  const trigger = useTriggerBot(chatRoomId)
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => trigger.mutate('BOT_WELCOME')}
        disabled={trigger.isPending}
      >
        <Sparkles className="mr-1 h-3.5 w-3.5" /> 환영 메시지
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => trigger.mutate('BOT_REMINDER')}
        disabled={trigger.isPending}
      >
        리마인더
      </Button>
    </div>
  )
}
