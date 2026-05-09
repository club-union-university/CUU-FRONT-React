import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from 'boneyard-js/react'
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
  Textarea,
  toast,
} from '@/shared/ui'
import { useApproveClub, useClubs, useRejectClub } from '@/features/club'
import { requireSuperAdmin } from '@/features/auth'
import type { Club } from '@/shared/api/types'

export const Route = createFileRoute('/_authed/admin/clubs')({
  beforeLoad: ({ location }) => requireSuperAdmin(location.pathname),
  component: AdminClubsPage,
})

function AdminClubsPage() {
  const pending = useClubs({ status: 'PENDING' })
  const approve = useApproveClub()
  const reject = useRejectClub()
  const [rejecting, setRejecting] = useState<Club | null>(null)
  const [reason, setReason] = useState('')

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
    <main className="container max-w-5xl py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">동아리 승인 대기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Super Admin 전용. 등록 신청된 동아리를 검토하고 승인 또는 거절합니다.
        </p>
      </div>

      <Skeleton name="admin-pending-clubs" loading={pending.isLoading}>
        {pending.data &&
          (pending.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                대기 중인 신청이 없습니다.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pending.data.map((club) => (
            <Card key={club.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <CardDescription className="mt-1">
                      학교 ID {club.schoolId} · 회장 ID {club.presidentUserId}
                    </CardDescription>
                  </div>
                  <Badge variant="warning">승인 대기</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap">{club.description ?? '소개 없음'}</p>
                {club.evidenceUrl && (
                  <a
                    href={club.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline"
                  >
                    실재 증빙 자료 보기
                  </a>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setRejecting(club)}
                    disabled={reject.isPending}
                  >
                    거절
                  </Button>
                  <Button
                    onClick={() => handleApprove(club.id!)}
                    disabled={approve.isPending}
                  >
                    승인
                  </Button>
                </div>
                </CardContent>
              </Card>
              ))}
            </div>
          ))}
      </Skeleton>

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>거절 사유 입력</DialogTitle>
            <DialogDescription>
              {rejecting?.name} 등록 신청을 거절합니다. 회장에게 전달됩니다.
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
