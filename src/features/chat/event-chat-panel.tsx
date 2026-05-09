import { useEffect, useRef, useState } from 'react'
import { Bot, MessageSquarePlus, Send } from 'lucide-react'
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
import { useChatMessages, useSendChatMessage, useTriggerBot } from './queries'
import { useAuthStore } from '@/features/auth'
import type { ChatMessage } from '@/shared/api/types'

interface EventChatPanelProps {
  chatRoomId: number
  botPersona?: string | null
}

export function EventChatPanel({ chatRoomId, botPersona }: EventChatPanelProps) {
  const me = useAuthStore((s) => s.user)

  return (
    <Card className="flex min-h-0 flex-1 flex-col rounded-none border-0 shadow-none">
      <CardHeader className="shrink-0 space-y-0 border-b px-3 py-2 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">채팅</CardTitle>
          {botPersona && (
            <Badge variant="secondary" className="gap-1 text-[11px] font-normal">
              <Bot className="h-3 w-3" /> {botPersona}
            </Badge>
          )}
        </div>
        <p className="pt-1 text-[11px] text-muted-foreground">폴링(약 3초). 전송은 Enter 또는 버튼.</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
        <MessageList chatRoomId={chatRoomId} myUserId={me?.id} />
        <BotTriggerRow chatRoomId={chatRoomId} />
        <MessageComposer chatRoomId={chatRoomId} />
      </CardContent>
    </Card>
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

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  return (
    <div ref={scrollerRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3 sm:px-4">
      {messages.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          메시지가 없습니다. 아래에서 안내 문구를 보낼 수 있습니다.
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
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border bg-muted/50 text-primary">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-medium">{m.botPersona ?? 'BOT'}</span>
            <span className="text-muted-foreground">{m.createdAt?.slice(11, 16) ?? ''}</span>
          </div>
          <div className="inline-block max-w-[95%] rounded-sm border border-border bg-muted/30 px-2.5 py-1.5 text-sm leading-relaxed">
            {m.content}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={cn('flex items-start gap-2', mine && 'flex-row-reverse')}>
      <Avatar seed={m.senderUserId} name={`U${m.senderUserId}`} size={28} />
      <div className={cn('min-w-0 flex-1', mine && 'text-right')}>
        <div
          className={cn(
            'mb-0.5 flex flex-wrap items-center gap-1.5 text-[11px]',
            mine && 'flex-row-reverse',
          )}
        >
          <span className="font-medium">{mine ? '나' : `사용자 #${m.senderUserId}`}</span>
          <span className="text-muted-foreground">{m.createdAt?.slice(11, 16) ?? ''}</span>
        </div>
        <div
          className={cn(
            'inline-block max-w-[95%] rounded-sm px-2.5 py-1.5 text-left text-sm leading-relaxed',
            mine ? 'bg-primary text-primary-foreground' : 'border border-border bg-muted/50',
          )}
        >
          {m.content}
        </div>
      </div>
    </div>
  )
}

function BotTriggerRow({ chatRoomId }: { chatRoomId: number }) {
  const trigger = useTriggerBot(chatRoomId)
  return (
    <div className="flex flex-wrap gap-1 border-t border-border px-3 py-2 sm:px-4">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => trigger.mutate('BOT_WELCOME')}
        disabled={trigger.isPending}
      >
        <MessageSquarePlus className="mr-1 h-3 w-3" /> 환영
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => trigger.mutate('BOT_REMINDER')}
        disabled={trigger.isPending}
      >
        리마인더
      </Button>
    </div>
  )
}

function MessageComposer({ chatRoomId }: { chatRoomId: number }) {
  const [text, setText] = useState('')
  const send = useSendChatMessage(chatRoomId)
  const sendingRef = useRef(false)

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
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-2 sm:p-3">
      <Input
        placeholder="메시지…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={send.isPending}
        className="h-9"
      />
      <Button type="submit" size="sm" className="shrink-0" disabled={send.isPending || !text.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
