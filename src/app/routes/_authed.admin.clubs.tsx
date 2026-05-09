import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  TableSkeleton,
  toast,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import {
  CLUB_CATEGORY_LABELS,
  useApproveClub,
  useClubs,
  useRejectClub,
} from '@/features/club'
import { useSchools } from '@/features/school'
import { requireSuperAdmin } from '@/features/auth'
import type { Club, ClubStatus } from '@/shared/api/types'

export const Route = createFileRoute('/_authed/admin/clubs')({
  beforeLoad: ({ location }) => requireSuperAdmin(location.pathname),
  component: AdminClubsPage,
})

type Tab = ClubStatus | 'ALL'

function AdminClubsPage() {
  const { data: clubs, isLoading } = useClubs({})
  const { data: schools } = useSchools({})
  const approve = useApproveClub()
  const reject = useRejectClub()

  const [tab, setTab] = useState<Tab>('PENDING')
  const [rejecting, setRejecting] = useState<Club | null>(null)
  const [reason, setReason] = useState('')

  const stats = useMemo(() => {
    const list = clubs ?? []
    return {
      total: list.length,
      pending: list.filter((c) => c.status === 'PENDING').length,
      approved: list.filter((c) => c.status === 'APPROVED').length,
      rejected: list.filter((c) => c.status === 'REJECTED').length,
    }
  }, [clubs])

  const filtered = useMemo(() => {
    const list = clubs ?? []
    return tab === 'ALL' ? list : list.filter((c) => c.status === tab)
  }, [clubs, tab])

  const schoolName = (id?: number) =>
    schools?.find((s) => s.id === id)?.name ?? `학교 #${id ?? '-'}`

  const handleApprove = async (id: number) => {
    try {
      await approve.mutateAsync(id)
      toast.success('승인 완료')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '승인 실패')
    }
  }

  const handleReject = async () => {
    if (!rejecting) return
    if (!reason.trim()) {
      toast.error('거절 사유를 입력하세요')
      return
    }
    try {
      await reject.mutateAsync({ id: rejecting.id!, rejectReason: reason })
      toast.success('거절 완료')
      setRejecting(null)
      setReason('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '거절 실패')
    }
  }

  return (
    <main className="container max-w-6xl py-10">
      <header className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">동아리 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Super Admin · 등록 신청 검토 및 승인·거절 처리
        </p>
      </header>

      <div className="mb-6 overflow-hidden rounded-md border border-border bg-card">
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <StatCell label="전체" value={stats.total} />
          <StatCell label="승인 대기" value={stats.pending} />
          <StatCell label="승인됨" value={stats.approved} />
          <StatCell label="거절됨" value={stats.rejected} />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-1 border-b">
        <TabButton active={tab === 'PENDING'} onClick={() => setTab('PENDING')}>
          승인 대기 <CountChip n={stats.pending} active={tab === 'PENDING'} />
        </TabButton>
        <TabButton active={tab === 'APPROVED'} onClick={() => setTab('APPROVED')}>
          승인됨 <CountChip n={stats.approved} active={tab === 'APPROVED'} />
        </TabButton>
        <TabButton active={tab === 'REJECTED'} onClick={() => setTab('REJECTED')}>
          거절됨 <CountChip n={stats.rejected} active={tab === 'REJECTED'} />
        </TabButton>
        <TabButton active={tab === 'ALL'} onClick={() => setTab('ALL')}>
          전체 <CountChip n={stats.total} active={tab === 'ALL'} />
        </TabButton>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton cols={7} rows={10} />
        ) : !clubs ? null : filtered.length === 0 ? (
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {tab === 'PENDING' ? '대기 중인 신청이 없습니다.' : '해당 상태의 동아리가 없습니다.'}
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">신청일</TableHead>
                <TableHead>동아리명</TableHead>
                <TableHead>학교</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>증빙</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-[180px] text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {club.createdAt?.slice(0, 10)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{club.name}</div>
                    {club.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {club.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{schoolName(club.schoolId)}</TableCell>
                  <TableCell>
                    {club.category && (
                      <Badge variant="secondary">{CLUB_CATEGORY_LABELS[club.category]}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {club.evidenceUrl ? (
                      <a
                        href={club.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                      >
                        링크 <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">없음</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={club.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {club.status === 'PENDING' ? (
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejecting(club)}
                          disabled={reject.isPending}
                        >
                          거절
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(club.id!)}
                          disabled={approve.isPending}
                        >
                          승인
                        </Button>
                      </div>
                    ) : club.status === 'REJECTED' && club.rejectReason ? (
                      <span className="text-xs text-muted-foreground" title={club.rejectReason}>
                        사유: {club.rejectReason.slice(0, 16)}
                        {club.rejectReason.length > 16 ? '…' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>거절 사유 입력</DialogTitle>
            <DialogDescription>
              {rejecting?.name} 등록 신청을 거절합니다. 회장에게 그대로 전달됩니다.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예: 실재 증빙 부족 / 학교 화이트리스트 미등록 등"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={reject.isPending}>
              거절 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

// ============================================================
// 요약 수치 (아이콘·파스텀 원 없이 표 형태)
// ============================================================

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-3.5 sm:py-4">
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  )
}

// ============================================================
// Tab Bar
// ============================================================

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function CountChip({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs tabular-nums',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}
    >
      {n}
    </span>
  )
}

// ============================================================
// Status Badge
// ============================================================

function StatusBadge({ status }: { status?: ClubStatus }) {
  if (status === 'PENDING')
    return (
      <span className="inline-flex rounded-sm border border-border bg-muted/50 px-2 py-px text-[11px] font-medium text-foreground">
        대기
      </span>
    )
  if (status === 'APPROVED')
    return (
      <span className="inline-flex rounded-sm border border-border px-2 py-px text-[11px] font-medium text-foreground">
        승인
      </span>
    )
  if (status === 'REJECTED')
    return (
      <span className="inline-flex rounded-sm border border-destructive/40 bg-destructive/5 px-2 py-px text-[11px] font-medium text-destructive">
        거절
      </span>
    )
  return null
}
