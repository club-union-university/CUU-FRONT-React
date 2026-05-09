import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { ArrowRight, Check, FilePenLine } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  toast,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import {
  eventKeys,
  useEvent,
  useEventAiStep1,
  useEventAiStep2,
  useEventTransition,
  useUpdateEvent,
} from '@/features/event'
import {
  buildAiStep1Body,
  facilityToAiPayload,
  parseEventCategory,
  schoolToAiPayload,
  step2AiResultToUpdatePatch,
} from '@/features/event/aiPayload'
import { useClub } from '@/features/club'
import { useSchool, useSchoolFacilities } from '@/features/school/queries'
import { requirePresident } from '@/features/auth'
import { ApiError } from '@/shared/api/error'
import type { Event } from '@/shared/api/types'
import { useState } from 'react'

function formatAiMutationError(e: unknown, fallback: string) {
  if (e instanceof ApiError && e.status === 403) {
    const serverHint =
      e.message &&
      !e.message.startsWith('Request failed with status code') &&
      e.message.length < 400
        ? ` (${e.message})`
        : ''
    return (
      '접근 거부(403). 해당 행사의 주최 동아리 회장인지 확인하고, 로그아웃 후 다시 로그인해 보세요.' +
      serverHint +
      ' Railway에서 jwt.secret이 바뀌면 기존 토큰으로도 403이 날 수 있습니다.'
    )
  }
  if (e instanceof ApiError && e.message) return e.message
  return e instanceof Error ? e.message : fallback
}

const wizardSearchSchema = z.object({
  step: z.coerce.number().int().min(1).max(3).optional().default(1),
})

export const Route = createFileRoute('/_authed/events/$eventId/wizard')({
  validateSearch: wizardSearchSchema,
  beforeLoad: ({ location }) => requirePresident(location.pathname),
  component: WizardPage,
})

function WizardPage() {
  const { eventId } = Route.useParams()
  const id = Number(eventId)
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { data: event, isLoading } = useEvent(id)

  if (isLoading || !event) {
    return <p className="container py-10 text-sm text-muted-foreground">불러오는 중…</p>
  }

  const goStep = (n: number) =>
    navigate({ to: '/events/$eventId/wizard', params: { eventId }, search: { step: n } })

  return (
    <main className="container max-w-3xl py-10">
      <header className="mb-8">
        <Badge variant="secondary">{event.type === 'INTER_CLUB' ? '연합 행사' : '교내 행사'}</Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">행사 위저드 — Step {search.step}/3</p>
      </header>

      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => goStep(n)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium',
                search.step === n
                  ? 'bg-primary text-primary-foreground border-primary'
                  : search.step > n
                    ? 'bg-primary/20 text-primary border-primary/40'
                    : 'bg-muted text-muted-foreground border-muted',
              )}
            >
              {search.step > n ? <Check className="h-4 w-4" /> : n}
            </button>
            <span
              className={cn(
                'text-sm font-medium',
                search.step === n ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {n === 1 ? '기본 정보' : n === 2 ? '게시판/장소' : '최종 승인'}
            </span>
            {n !== 3 && <div className="mx-2 h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      {search.step === 1 && <Step1 eventId={id} onNext={() => goStep(2)} />}
      {search.step === 2 && <Step2 eventId={id} onNext={() => goStep(3)} />}
      {search.step === 3 && <Step3 eventId={id} />}
    </main>
  )
}

// ============================================================
// Step 1: 초안 정리 → 제목/카테고리/설명 검토
// ============================================================

function Step1({ eventId, onNext }: { eventId: number; onNext: () => void }) {
  const qc = useQueryClient()
  const { data: event } = useEvent(eventId)
  const hostClub = useClub(event?.hostClubId ?? 0)
  const partnerClub = useClub(event?.partnerClubId ?? 0)
  const aiStep1 = useEventAiStep1(eventId)
  const update = useUpdateEvent(eventId)
  const [refined, setRefined] = useState<{
    title?: string
    category?: string
    description?: string
    format?: string
  } | null>(null)

  const handleAi = async () => {
    try {
      const body = buildAiStep1Body({
        naturalText: event?.proposalMessage ?? '',
        eventType: event?.type,
        hostClubName: hostClub.data?.name,
        partnerClubName:
          event?.type === 'INTER_CLUB' ? partnerClub.data?.name : undefined,
      })
      const res = await aiStep1.mutateAsync(body)
      // 응답 스키마는 서버 버전에 맞춰 known 키만 반영
      setRefined({
        title: typeof res.title === 'string' ? res.title : undefined,
        category: typeof res.category === 'string' ? res.category : undefined,
        description: typeof res.description === 'string' ? res.description : undefined,
        format: typeof res.format === 'string' ? res.format : undefined,
      })
      toast.success('항목 채우기 완료. 검토 후 적용하세요.')
    } catch (e) {
      toast.error(formatAiMutationError(e, '항목 채우기 실패'))
    }
  }

  const handleApply = async () => {
    if (!refined) return
    try {
      const category = parseEventCategory(refined.category)
      await update.mutateAsync({
        title: refined.title || event?.title,
        description: refined.description,
        format: refined.format,
        ...(category ? { category } : {}),
      })
      // PATCH 무효화 후 GET이 끝난 뒤, 편집한 초안을 step1Data에 합쳐 Step2 요청 맥락과 일치시킴
      await qc.refetchQueries({ queryKey: eventKeys.detail(eventId) })
      qc.setQueryData<Event | undefined>(eventKeys.detail(eventId), (prev) => {
        if (!prev) return prev
        const base =
          prev.step1Data &&
          typeof prev.step1Data === 'object' &&
          !Array.isArray(prev.step1Data)
            ? { ...(prev.step1Data as Record<string, unknown>) }
            : {}
        const edits = Object.fromEntries(
          Object.entries(refined).filter(([, v]) => v !== undefined),
        ) as Record<string, unknown>
        return { ...prev, step1Data: { ...base, ...edits } }
      })
      toast.success('적용 완료')
      onNext()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '적용 실패')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1 · 기본 정보</CardTitle>
        <CardDescription>
          아래에 적어 둔 설명을 바탕으로 제목·분류·본문 초안을 채웁니다. 결과를 확인한 뒤 그대로 쓰거나
          고쳐서 적용하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-md border bg-muted p-3 text-sm">
          <p className="font-medium text-muted-foreground">제출한 설명</p>
          <p className="mt-1 whitespace-pre-wrap">
            {event?.proposalMessage ?? '(설명 없음)'}
          </p>
        </div>

        {!refined ? (
          <Button size="lg" className="w-full" onClick={handleAi} disabled={aiStep1.isPending}>
            <FilePenLine className="mr-2 h-4 w-4" />
            {aiStep1.isPending ? '초안 작성 중… (잠시만요)' : '제목·설명 초안 만들기'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>제목 (정제됨)</Label>
              <Input
                value={refined.title ?? ''}
                onChange={(e) => setRefined({ ...refined, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Input
                value={refined.category ?? ''}
                onChange={(e) => setRefined({ ...refined, category: e.target.value })}
                placeholder="HACKATHON / MEETUP / STUDY / FESTIVAL / WORKSHOP"
              />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                rows={5}
                value={refined.description ?? ''}
                onChange={(e) => setRefined({ ...refined, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>형태</Label>
              <Input
                value={refined.format ?? ''}
                onChange={(e) => setRefined({ ...refined, format: e.target.value })}
                placeholder="예: 무박 24시간 / 1박 2일 / 4시간"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRefined(null)} disabled={aiStep1.isPending}>
                다시 만들기
              </Button>
              <Button onClick={handleApply} disabled={update.isPending}>
                {update.isPending ? '적용 중…' : '적용 후 다음'}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// Step 2: 게시판 카테고리 + 공지글 + 장소 추천
// ============================================================

function Step2({ eventId, onNext }: { eventId: number; onNext: () => void }) {
  const { data: event } = useEvent(eventId)
  const hostClub = useClub(event?.hostClubId ?? 0)
  const partnerClub = useClub(event?.partnerClubId ?? 0)
  const hostSchoolId = hostClub.data?.schoolId ?? 0
  const partnerSchoolId =
    event?.type === 'INTER_CLUB' ? (partnerClub.data?.schoolId ?? 0) : 0
  const { data: hostSchool } = useSchool(hostSchoolId)
  const { data: partnerSchool } = useSchool(partnerSchoolId)
  const { data: hostFacilities = [] } = useSchoolFacilities(hostSchoolId)

  const aiStep2 = useEventAiStep2(eventId)
  const update = useUpdateEvent(eventId)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const handleAi = async () => {
    if (!event?.step1Data) {
      toast.error('먼저 Step 1에서 초안 만들기를 실행하세요.')
      return
    }
    try {
      const schools: Record<string, unknown>[] = []
      const h = schoolToAiPayload(hostSchool)
      if (h) schools.push(h)
      if (event.type === 'INTER_CLUB') {
        const p = schoolToAiPayload(partnerSchool)
        if (p) schools.push(p)
      }
      const facilities = hostFacilities.map(facilityToAiPayload)

      const res = await aiStep2.mutateAsync({
        step1Result: event.step1Data,
        schools,
        facilities,
      })
      setResult(res)
      toast.success('장소·공지 초안이 준비됨')
    } catch (e) {
      toast.error(formatAiMutationError(e, '초안 작성 실패'))
    }
  }

  const handleApply = async () => {
    if (!result) return
    try {
      const patch = step2AiResultToUpdatePatch(result)
      await update.mutateAsync(patch)
      toast.success('장소/공지 적용 완료')
      onNext()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '적용 실패')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2 · 게시판 카테고리 + 장소</CardTitle>
        <CardDescription>
          지도·거리 정보를 참고해 게시판에 맞는 분류, 공지 초안, 장소 후보를 함께 채웁니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!result ? (
          <>
            {!event?.step1Data && (
              <p className="text-xs text-muted-foreground">
                Step 1에서 생성된 초안(step1Data)이 있어야 장소·공지 추천에 필요한 맥락을 보낼 수 있습니다.
              </p>
            )}
          <Button
            size="lg"
            className="w-full"
            onClick={handleAi}
            disabled={aiStep2.isPending || !event?.step1Data}
          >
            <FilePenLine className="mr-2 h-4 w-4" />
            {aiStep2.isPending ? '찾는 중… (조금 더 걸려요)' : '장소·공지 초안 만들기'}
          </Button>
          </>
        ) : (
          <>
            <div className="rounded-md border bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground">생성 결과 (원본 데이터)</p>
              <pre className="mt-2 max-h-80 overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setResult(null)}>
                다시
              </Button>
              <Button onClick={handleApply} disabled={update.isPending}>
                {update.isPending ? '적용 중…' : '적용 후 다음'}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// Step 3: 최종 승인
// ============================================================

function Step3({ eventId }: { eventId: number }) {
  const navigate = useNavigate()
  const { data: event } = useEvent(eventId)
  const transition = useEventTransition(eventId)
  const isInter = event?.type === 'INTER_CLUB'

  const handleApprove = async () => {
    try {
      if (isInter) {
        await transition.submit.mutateAsync()
        toast.success('파트너 동아리 검토 요청 완료')
      } else {
        await transition.approve.mutateAsync()
        toast.success('승인 완료')
      }
      navigate({ to: '/events/$eventId', params: { eventId: String(eventId) } })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '승인 실패')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3 · 최종 확인</CardTitle>
        <CardDescription>
          {isInter
            ? '연합 행사: 파트너 동아리 회장에게 승인 요청을 보냅니다.'
            : '교내 행사: 승인 즉시 다중 노출 발행됩니다.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <dt className="text-muted-foreground">제목</dt>
          <dd className="col-span-2 font-medium">{event?.title}</dd>
          <dt className="text-muted-foreground">타입</dt>
          <dd className="col-span-2">{isInter ? '연합' : '교내'}</dd>
          <dt className="text-muted-foreground">카테고리</dt>
          <dd className="col-span-2">{event?.category ?? '미지정'}</dd>
          <dt className="text-muted-foreground">장소</dt>
          <dd className="col-span-2">{event?.locationName ?? '미지정'}</dd>
        </dl>
        <Button size="lg" className="w-full" onClick={handleApprove} disabled={transition.approve.isPending || transition.submit.isPending}>
          <Check className="mr-2 h-4 w-4" />
          {isInter ? '파트너에게 검토 요청' : '승인하고 발행'}
        </Button>
      </CardContent>
    </Card>
  )
}
