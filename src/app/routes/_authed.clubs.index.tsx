import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Skeleton } from 'boneyard-js/react'
import { z } from 'zod'
import { Plus, KeyRound, Building2 } from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@/shared/ui'
import { CLUB_CATEGORY_LABELS, CLUB_STATUS_LABELS, useClubs, useJoinClubByCode } from '@/features/club'
import { useAuthStore } from '@/features/auth'
import type { Club, ClubCategory } from '@/shared/api/types'

const clubsSearchSchema = z.object({
  clubCategory: z.enum(['DEV', 'DESIGN', 'STARTUP', 'ART', 'SPORTS']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  schoolId: z.coerce.number().int().optional(),
})

export const Route = createFileRoute('/_authed/clubs/')({
  validateSearch: clubsSearchSchema,
  component: ClubsListPage,
})

function ClubsListPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: clubs, isLoading } = useClubs({
    category: search.clubCategory,
    status: search.status ?? 'APPROVED',
    schoolId: search.schoolId,
  })

  const canJoin = user?.role !== 'SUPER_ADMIN'

  return (
    <main className="container max-w-5xl py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">동아리</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            화이트리스트 학교 기준, 필터된 목록입니다.
          </p>
        </div>
        <div className="flex gap-2">
          {canJoin && <JoinByCodeButton />}
          {user?.role === 'PRESIDENT' && (
            <Button asChild>
              <Link to="/clubs/new">
                <Plus className="mr-1 h-4 w-4" /> 동아리 등록
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select
          value={search.clubCategory ?? 'ALL'}
          onValueChange={(v) =>
            navigate({
              search: (s) => ({
                ...s,
                clubCategory: v === 'ALL' ? undefined : (v as ClubCategory),
              }),
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 카테고리</SelectItem>
            {Object.entries(CLUB_CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Skeleton name="clubs-list" loading={isLoading}>
        {clubs &&
          (clubs.length === 0 ? (
            <Card>
              <EmptyState
                icon={Building2}
                title="아직 등록된 동아리가 없습니다"
                description={
                  user?.role === 'PRESIDENT'
                    ? '회장이라면 직접 등록을 시작해 보세요.'
                    : '곧 동아리들이 등록될 예정입니다.'
                }
                action={
                  user?.role === 'PRESIDENT' && (
                    <Button asChild>
                      <Link to="/clubs/new">
                        <Plus className="mr-1 h-4 w-4" /> 동아리 등록
                      </Link>
                    </Button>
                  )
                }
              />
            </Card>
          ) : (
            <div className="overflow-hidden rounded-md border bg-card">
              <ul className="divide-y divide-border">
                {clubs.map((club) => (
                  <ClubRow key={club.id} club={club} />
                ))}
              </ul>
            </div>
          ))}
      </Skeleton>
    </main>
  )
}

function ClubRow({ club }: { club: Club }) {
  const statusMeta =
    club.status && club.status !== 'APPROVED' ? CLUB_STATUS_LABELS[club.status] : null

  return (
    <li>
      <Link
        to="/clubs/$clubId"
        params={{ clubId: String(club.id) }}
        className="group block px-4 py-3.5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:py-4"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <span className="font-medium leading-snug text-foreground group-hover:underline group-hover:decoration-muted-foreground/60">
              {club.name}
            </span>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {club.description?.trim() || '등록된 설명이 없습니다.'}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:flex-col sm:items-end sm:text-right">
            {club.category && (
              <span>{CLUB_CATEGORY_LABELS[club.category]}</span>
            )}
            {statusMeta && (
              <span className="rounded border border-border bg-muted/40 px-1.5 py-px text-[11px] text-foreground">
                {statusMeta.label}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  )
}

function JoinByCodeButton() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const join = useJoinClubByCode()

  const reset = () => {
    setCode('')
    setOpen(false)
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('초대 코드를 입력하세요')
      return
    }
    try {
      const member = await join.mutateAsync(code.trim())
      toast.success('가입 완료')
      reset()
      navigate({ to: '/clubs/$clubId', params: { clubId: String(member.clubId) } })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '가입 실패 — 코드를 확인하세요')
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <KeyRound className="mr-1 h-4 w-4" /> 초대 코드 가입
      </Button>
      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(v) : reset())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>동아리 초대 코드</DialogTitle>
            <DialogDescription>
              회장에게서 받은 초대 코드를 입력하세요. 즉시 부원으로 등록됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="invite-code">초대 코드</Label>
            <Input
              id="invite-code"
              autoFocus
              placeholder="예: HYE-LIKELION"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <p className="text-xs text-muted-foreground">
              데모 시드: HYE-LIKELION / INHA-LIKELION / AJOU-GDSC / GACHON-DESIGN
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={reset}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={join.isPending}>
              {join.isPending ? '확인 중…' : '가입'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
