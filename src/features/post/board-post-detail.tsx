import { useState, type ReactNode } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  Badge,
  BoardPostDetailSkeleton,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from '@/shared/ui'
import { useAuthStore } from '@/features/auth'
import type { BoardType } from '@/shared/api/types'
import { postCategoryLabel } from './categories'
import { PostCommentThread } from './post-comment-thread'
import { PostFormDialog } from './post-form-dialog'
import { useDeletePost, usePost } from './queries'

export interface BoardPostDetailProps {
  boardType: BoardType
  targetId: number
  postId: number
  readOnly: boolean
  backLink: ReactNode
  onDeleted: () => void
}

export function BoardPostDetail({
  boardType,
  targetId,
  postId,
  readOnly,
  backLink,
  onDeleted,
}: BoardPostDetailProps) {
  const [editOpen, setEditOpen] = useState(false)
  const validId = Number.isFinite(postId) && postId > 0
  const { data: post, isLoading, isError, error } = usePost(validId ? postId : 0)
  const del = useDeletePost()
  const user = useAuthStore((s) => s.user)

  if (!validId) {
    return (
      <main className="container max-w-4xl py-10">
        <div className="mb-8 text-sm font-medium">{backLink}</div>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            잘못된 게시글 주소입니다.
          </CardContent>
        </Card>
      </main>
    )
  }

  const mismatch =
    post && (post.boardType !== boardType || post.targetId !== targetId)
  const isAuthor = post && user?.id === post.authorId

  const handleDelete = async () => {
    if (!post?.id || !confirm('이 글을 삭제하시겠습니까?')) return
    try {
      await del.mutateAsync(post.id)
      toast.success('삭제 완료')
      onDeleted()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '삭제 실패')
    }
  }

  return (
    <main className="container max-w-4xl py-10">
      <div className="mb-8 text-sm font-medium text-muted-foreground [&_a:hover]:text-foreground">
        {backLink}
      </div>

      {isLoading ? (
        <BoardPostDetailSkeleton />
      ) : (
        <>
          {isError && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {error instanceof Error ? error.message : '글을 불러오지 못했습니다.'}
              </CardContent>
            </Card>
          )}

          {post && mismatch && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                이 게시판에 속한 글이 아닙니다.
              </CardContent>
            </Card>
          )}

          {post && !mismatch && (
            <Card>
              <CardHeader className="space-y-4 border-b pb-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {post.isOfficialNotice && <Badge variant="warning">공식 공지</Badge>}
                      {post.category && (
                        <Badge variant="secondary">{postCategoryLabel(post.category)}</Badge>
                      )}
                      <span className="text-muted-foreground">
                        작성자 #{post.authorId} · {post.createdAt?.slice(0, 10)}
                        {post.updatedAt && post.updatedAt !== post.createdAt && (
                          <> · 수정 {post.updatedAt.slice(0, 10)}</>
                        )}
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-snug sm:text-2xl">{post.title}</CardTitle>
                  </div>
                  {!readOnly && isAuthor && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                          <Pencil className="mr-2 h-4 w-4" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={handleDelete}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                  {post.content}
                </div>
                {!readOnly && <PostCommentThread postId={post.id!} />}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!readOnly && post && !mismatch && (
        <PostFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          boardType={boardType}
          targetId={targetId}
          editing={post}
        />
      )}
    </main>
  )
}
