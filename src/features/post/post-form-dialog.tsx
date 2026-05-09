import { useState } from 'react'
import type { BoardType, Post, PostCategory } from '@/shared/api/types'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { POST_CATEGORIES } from './categories'
import { useCreatePost, useUpdatePost } from './queries'

export function PostFormDialog({
  open,
  onOpenChange,
  boardType,
  targetId,
  editing,
  defaultCategory,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  boardType: BoardType
  targetId: number
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
          boardType,
          targetId,
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
          <DialogDescription>카테고리, 제목, 내용을 입력하세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_CATEGORIES.map((c) => (
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
