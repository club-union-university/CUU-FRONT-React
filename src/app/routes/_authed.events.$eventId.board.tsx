import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Megaphone,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import { useEvent } from '@/features/event'
import {
  useComments,
  useCreateComment,
  useCreatePost,
  useDeleteComment,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from '@/features/post'
import { useAuthStore } from '@/features/auth'
import type { Post, PostCategory } from '@/shared/api/types'

const boardSearchSchema = z.object({
  category: z.enum(['NOTICE', 'SCHEDULE', 'TEAM_BUILDING', 'QNA', 'RESOURCE']).optional(),
})

export const Route = createFileRoute('/_authed/events/$eventId/board')({
  validateSearch: boardSearchSchema,
  component: EventBoardPage,
})

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: 'NOTICE', label: '공지' },
  { value: 'SCHEDULE', label: '일정' },
  { value: 'TEAM_BUILDING', label: '팀빌딩' },
  { value: 'QNA', label: 'Q&A' },
  { value: 'RESOURCE', label: '자료실' },
]

function EventBoardPage() {
  const { eventId } = Route.useParams()
  const id = Number(eventId)
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: event } = useEvent(id)
  const [writeOpen, setWriteOpen] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)

  const { data: posts, isLoading } = usePosts({
    boardType: 'EVENT',
    targetId: id,
    category: search.category,
  })

  return (
    <main className="container max-w-4xl py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{event?.title} · 게시판</h1>
        </div>
        <Button onClick={() => setWriteOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> 글쓰기
        </Button>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <CategoryChip
          active={!search.category}
          onClick={() => navigate({ search: { category: undefined } })}
        >
          전체
        </CategoryChip>
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c.value}
            active={search.category === c.value}
            onClick={() => navigate({ search: { category: c.value } })}
          >
            {c.label}
          </CategoryChip>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      ) : !posts?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            아직 게시글이 없습니다. 첫 글을 작성해 보세요.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onEdit={() => setEditing(post)} />
          ))}
        </div>
      )}

      {/* 작성 다이얼로그 */}
      <PostFormDialog
        open={writeOpen}
        onOpenChange={setWriteOpen}
        eventId={id}
        defaultCategory={search.category}
      />

      {/* 수정 다이얼로그 */}
      <PostFormDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        eventId={id}
        editing={editing ?? undefined}
      />
    </main>
  )
}

function CategoryChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}

// ============================================================
// PostCard — 클릭 시 인라인 확장: 본문 + 댓글
// ============================================================

function PostCard({ post, onEdit }: { post: Post; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isAuthor = user?.id === post.authorId
  const del = useDeletePost()

  const handleDelete = async () => {
    if (!confirm('이 글을 삭제하시겠습니까?')) return
    try {
      await del.mutateAsync(post.id!)
      toast.success('삭제 완료')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '삭제 실패')
    }
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded((e) => !e)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2 text-xs">
              {post.isOfficialNotice && <Badge variant="warning">공식 공지</Badge>}
              {post.category && (
                <Badge variant="secondary">
                  {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
                </Badge>
              )}
              <span className="text-muted-foreground">
                작성자 #{post.authorId} · {post.createdAt?.slice(0, 10)}
              </span>
            </div>
            <CardTitle className="text-base">{post.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" /> 수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> 삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-5 border-t pt-5">
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
          <CommentThread postId={post.id!} />
        </CardContent>
      )}
    </Card>
  )
}

// ============================================================
// CommentThread
// ============================================================

function CommentThread({ postId }: { postId: number }) {
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

// ============================================================
// PostFormDialog — 작성 + 수정 공용
// ============================================================

function PostFormDialog({
  open,
  onOpenChange,
  eventId,
  editing,
  defaultCategory,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  eventId: number
  editing?: Post
  defaultCategory?: PostCategory
}) {
  const create = useCreatePost()
  const update = useUpdatePost(editing?.id ?? 0)
  const [title, setTitle] = useState(editing?.title ?? '')
  const [content, setContent] = useState(editing?.content ?? '')
  const [category, setCategory] = useState<PostCategory>(
    editing?.category ?? defaultCategory ?? 'NOTICE',
  )

  // editing 변경 시 폼 동기화
  if (open && editing && editing.id !== 0 && title === '' && editing.title) {
    setTitle(editing.title)
    setContent(editing.content ?? '')
    setCategory(editing.category ?? 'NOTICE')
  }

  const reset = () => {
    setTitle('')
    setContent('')
    setCategory(defaultCategory ?? 'NOTICE')
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력하세요')
      return
    }
    try {
      if (editing) {
        await update.mutateAsync({ title, content, category })
        toast.success('수정 완료')
      } else {
        await create.mutateAsync({
          boardType: 'EVENT',
          targetId: eventId,
          title,
          content,
          category,
        })
        toast.success('등록 완료')
      }
      reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '실패')
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : reset())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? '게시글 수정' : '새 게시글'}</DialogTitle>
          <DialogDescription>
            카테고리, 제목, 내용을 입력하세요. 호스트가 작성한 글에는 공식 공지 마크가 붙습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-title">제목</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-content">내용</Label>
            <Textarea
              id="post-content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용 (마크다운 미지원, 일반 텍스트)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={reset} disabled={isPending}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? '저장 중…' : editing ? '수정' : '등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ChevronRight unused import 제거 위해 reference
void ChevronRight
