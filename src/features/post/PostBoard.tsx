import { createElement, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  PostBoardListSkeleton,
  toast,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/auth'
import type { BoardType, Post, PostCategory } from '@/shared/api/types'
import { POST_CATEGORIES, postCategoryLabel } from './categories'
import { PostFormDialog } from './post-form-dialog'
import { useDeletePost, usePosts } from './queries'

export interface PostBoardProps {
  boardType: BoardType
  targetId: number
  /** 작성/수정/삭제/댓글 모두 비활성. 학교/동아리 디스커버리 보드용. */
  readOnly?: boolean
  /** 외부 컨트롤 카테고리 (URL search params 등). 미전달 시 내부 state. */
  category?: PostCategory
  onCategoryChange?: (next: PostCategory | undefined) => void
}

export function PostBoard({
  boardType,
  targetId,
  readOnly = false,
  category: controlledCategory,
  onCategoryChange,
}: PostBoardProps) {
  const [internalCategory, setInternalCategory] = useState<PostCategory | undefined>()
  const category = controlledCategory ?? internalCategory
  const setCategory = onCategoryChange ?? setInternalCategory

  const [writeOpen, setWriteOpen] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)

  const { data: posts, isLoading } = usePosts({ boardType, targetId, category })
  const canWrite = !readOnly

  return (
    <div>
      {canWrite && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setWriteOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> 글쓰기
          </Button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <CategoryChip active={!category} onClick={() => setCategory(undefined)}>
          전체
        </CategoryChip>
        {POST_CATEGORIES.map((c) => (
          <CategoryChip
            key={c.value}
            active={category === c.value}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </CategoryChip>
        ))}
      </div>

      {isLoading ? (
        <PostBoardListSkeleton rows={8} />
      ) : !posts ? null : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-copy text-muted-foreground">
            {readOnly
              ? '아직 게시글이 없습니다.'
              : '아직 게시글이 없습니다. 첫 글을 작성해 보세요.'}
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              boardType={boardType}
              targetId={targetId}
              readOnly={readOnly || !canWrite}
              onEdit={() => setEditing(post)}
            />
          ))}
        </ul>
      )}

      {canWrite && (
        <>
          <PostFormDialog
            open={writeOpen}
            onOpenChange={setWriteOpen}
            boardType={boardType}
            targetId={targetId}
            defaultCategory={category}
          />
          <PostFormDialog
            open={!!editing}
            onOpenChange={(v) => !v && setEditing(null)}
            boardType={boardType}
            targetId={targetId}
            editing={editing ?? undefined}
          />
        </>
      )}
    </div>
  )
}

/**
 * 일부 `Register`/`Link` 조합에서 행사·학교 게시글 상세 경로만 유니온에서 빠져 TS가 오탑으로 본다.
 * 런타임 경로·params는 routeTree와 동일하므로 여기서만 느슨하게 캐스팅한다.
 */
function RouterLinkLoose(props: {
  to: string
  params: Record<string, string>
  className?: string
  children?: React.ReactNode
}) {
  return createElement(Link, props as never)
}

function ClubBoardPostNavLink(props: {
  clubId: string
  postId: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      to="/clubs/$clubId/board/$postId"
      params={{ clubId: props.clubId, postId: props.postId }}
      className={props.className}
    >
      {props.children}
    </Link>
  )
}

function EventBoardPostNavLink(props: {
  eventId: string
  postId: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <RouterLinkLoose
      to="/events/$eventId/board/$postId"
      params={{ eventId: props.eventId, postId: props.postId }}
      className={props.className}
    >
      {props.children}
    </RouterLinkLoose>
  )
}

function SchoolBoardPostNavLink(props: {
  schoolId: string
  postId: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <RouterLinkLoose
      to="/schools/$schoolId/board/$postId"
      params={{ schoolId: props.schoolId, postId: props.postId }}
      className={props.className}
    >
      {props.children}
    </RouterLinkLoose>
  )
}

function PostDetailLink({
  boardType,
  targetId,
  postId,
  className,
  children,
}: {
  boardType: BoardType
  targetId: number
  postId: number
  className?: string
  children: React.ReactNode
}) {
  const pid = String(postId)
  const tid = String(targetId)

  if (boardType === 'CLUB') {
    return (
      <ClubBoardPostNavLink clubId={tid} postId={pid} className={className}>
        {children}
      </ClubBoardPostNavLink>
    )
  }
  if (boardType === 'EVENT') {
    return (
      <EventBoardPostNavLink eventId={tid} postId={pid} className={className}>
        {children}
      </EventBoardPostNavLink>
    )
  }
  if (boardType === 'SCHOOL') {
    return (
      <SchoolBoardPostNavLink schoolId={tid} postId={pid} className={className}>
        {children}
      </SchoolBoardPostNavLink>
    )
  }
  return null
}

function formatPostedAt(iso: string | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return iso.slice(0, 10)
  }
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

function PostRow({
  post,
  boardType,
  targetId,
  onEdit,
  readOnly,
}: {
  post: Post
  boardType: BoardType
  targetId: number
  onEdit: () => void
  readOnly: boolean
}) {
  const user = useAuthStore((s) => s.user)
  const isAuthor = !readOnly && user?.id === post.authorId
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

  const postedMeta = formatPostedAt(post.createdAt)
  const selfLabel =
    user?.id !== undefined &&
    user.id !== null &&
    post.authorId !== undefined &&
    user.id === post.authorId ? (
      <span className="text-copy-sm font-medium text-primary">내 글</span>
    ) : null

  return (
    <li className="group/post-row flex items-stretch overflow-hidden rounded-lg border border-border/60 bg-card shadow-xs ring-offset-background transition-[box-shadow,border-color] duration-normal ease-out-expo hover:border-border hover:shadow-sm">
      <PostDetailLink
        boardType={boardType}
        targetId={targetId}
        postId={post.id!}
        className="flex min-w-0 flex-1 flex-col gap-1.5 px-4 py-4 outline-none transition-colors group-hover/post-row:bg-primary-soft/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5 sm:py-[1.125rem]"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {post.isOfficialNotice && <Badge variant="warning">공식 공지</Badge>}
          {post.category && (
            <Badge variant="secondary">{postCategoryLabel(post.category)}</Badge>
          )}
          {postedMeta && (
            <span className="text-copy-sm text-muted-foreground">{postedMeta}</span>
          )}
          {postedMeta && selfLabel && (
            <span className="text-copy-sm text-muted-foreground/80" aria-hidden>
              ·
            </span>
          )}
          {selfLabel}
        </div>
        <CardTitle className="text-left text-base font-semibold leading-snug">{post.title}</CardTitle>
      </PostDetailLink>
      <div className="flex shrink-0 items-center gap-0.5 border-l border-border/50 bg-muted/20 px-1.5 sm:px-2">
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                aria-label="글 메뉴"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        <ChevronRight
          className="mr-0.5 h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform duration-normal ease-out-expo group-hover/post-row:translate-x-0.5"
          aria-hidden
        />
      </div>
    </li>
  )
}
