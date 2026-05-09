import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Plus, KeyRound } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  toast,
} from '@/shared/ui'
import { useClubs, useJoinClubByCode } from '@/features/club'
import { useAuthStore } from '@/features/auth'
import type { ClubCategory, ClubStatus } from '@/shared/api/types'

const clubsSearchSchema = z.object({
  clubCategory: z.enum(['DEV', 'DESIGN', 'STARTUP', 'ART', 'SPORTS']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  schoolId: z.coerce.number().int().optional(),
})

export const Route = createFileRoute('/_authed/clubs/')({
  validateSearch: clubsSearchSchema,
  component: ClubsListPage,
})

const categoryLabels: Record<ClubCategory, string> = {
  DEV: '개발',
  DESIGN: '디자인',
  STARTUP: '창업',
  ART: '예술',
  SPORTS: '스포츠',
}

const statusBadge: Record<ClubStatus, { label: string; variant: 'default' | 'warning' | 'destructive' }> = {
  PENDING: { label: '승인 대기', variant: 'warning' },
  APPROVED: { label: '승인됨', variant: 'default' },
  REJECTED: { label: '거절됨', variant: 'destructive' },
}

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
          <h1 className="text-3xl font-bold tracking-tight">동아리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            경인권 화이트리스트 학교의 승인된 동아리를 둘러봅니다.
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
            {Object.entries(categoryLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      ) : !clubs?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            아직 등록된 동아리가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Link
              key={club.id}
              to="/clubs/$clubId"
              params={{ clubId: String(club.id) }}
              className="block transition-transform hover:-translate-y-0.5"
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    {club.status && (
                      <Badge variant={statusBadge[club.status].variant}>
                        {statusBadge[club.status].label}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {club.description ?? '설명 없음'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {club.category && (
                    <Badge variant="secondary">{categoryLabels[club.category]}</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
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
