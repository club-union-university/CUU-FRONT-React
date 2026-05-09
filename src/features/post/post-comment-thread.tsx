import { useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Button, Input, toast } from '@/shared/ui'
import { useAuthStore } from '@/features/auth'
import { useComments, useCreateComment, useDeleteComment } from './queries'

export function PostCommentThread({ postId }: { postId: number }) {
  const [text, setText] = useState('')
  const { data: comments, isLoading } = useComments(postId)
  const create = useCreateComment(postId)
  const del = useDeleteComment(postId)
  const user = useAuthStore((s) => s.user)

  const handleSubmit = async () => {
    if (!text.trim()) return
    try {
      await create.mutateAsync(text.trim())
      setText('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '댓글 실패')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    try {
      await del.mutateAsync(id)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '삭제 실패')
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span>댓글 {comments?.length ?? 0}</span>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">불러오는 중…</p>
      ) : comments && comments.length > 0 ? (
        <ul className="divide-y rounded-md border bg-muted/30">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  #{c.authorId} · {c.createdAt?.slice(0, 16).replace('T', ' ')}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm">{c.content}</p>
              </div>
              {user?.id === c.authorId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleDelete(c.id!)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">아직 댓글이 없습니다.</p>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="댓글 입력 후 Enter"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={create.isPending}>
          등록
        </Button>
      </div>
    </section>
  )
}
