import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useCreateEvent } from '@/features/event'
import { useClubs } from '@/features/club'
import { requirePresident, useAuthStore } from '@/features/auth'

const newSearchSchema = z.object({
  hostClubId: z.coerce.number().int().optional(),
})

export const Route = createFileRoute('/_authed/events/new')({
  validateSearch: newSearchSchema,
  beforeLoad: ({ location }) => requirePresident(location.pathname),
  component: NewEventPage,
})

const schema = z.object({
  type: z.enum(['INTRA_CLUB', 'INTER_CLUB']),
  hostClubId: z.coerce.number().int().positive('주최 동아리를 선택하세요'),
  partnerClubId: z.coerce.number().int().optional(),
  title: z.string().min(2, '제목 2자 이상').max(100),
  proposalMessage: z.string().min(10, '행사를 10자 이상으로 간단히 적어 주세요').max(1000),
})

type Values = z.infer<typeof schema>

function NewEventPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const user = useAuthStore((s) => s.user)
  const create = useCreateEvent()
  const clubs = useClubs({ status: 'APPROVED' })

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'INTRA_CLUB',
      hostClubId: search.hostClubId ?? 0,
      title: '',
      proposalMessage: '',
    },
  })

  const type = form.watch('type')
  const myClubs = clubs.data?.filter((c) => c.presidentUserId === user?.id) ?? []
  const partnerCandidates =
    clubs.data?.filter((c) => c.id !== form.watch('hostClubId')) ?? []

  const onSubmit = form.handleSubmit(async (v) => {
    if (v.type === 'INTER_CLUB' && !v.partnerClubId) {
      form.setError('partnerClubId', { message: '연합은 파트너 동아리를 선택해야 합니다' })
      return
    }
    try {
      const ev = await create.mutateAsync({
        type: v.type,
        hostClubId: v.hostClubId,
        partnerClubId: v.type === 'INTER_CLUB' ? v.partnerClubId : undefined,
        title: v.title,
        proposalMessage: v.proposalMessage,
      })
      toast.success('초안이 생성되었습니다. 위저드로 이동합니다.')
      navigate({ to: '/events/$eventId/wizard', params: { eventId: String(ev.id) } })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '생성 실패')
    }
  })

  return (
    <main className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>새 행사 만들기</CardTitle>
          <CardDescription>
            설명만 적어 두면 다음 단계에서 제목·분류·본문 등 필요한 항목을 함께 채울 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>행사 타입</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['INTRA_CLUB', 'INTER_CLUB'] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={type === t ? 'default' : 'outline'}
                    className="h-auto flex-col gap-1 py-3"
                    onClick={() => form.setValue('type', t, { shouldValidate: true })}
                  >
                    <span className="font-semibold">{t === 'INTRA_CLUB' ? '교내' : '연합'}</span>
                    <span className="text-xs font-normal opacity-70">
                      {t === 'INTRA_CLUB' ? '주최 1개 동아리' : '2개 동아리 합동'}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>주최 동아리</Label>
              <Select
                value={String(form.watch('hostClubId') || '')}
                onValueChange={(v) =>
                  form.setValue('hostClubId', Number(v), { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="내가 회장인 동아리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {myClubs.length === 0 ? (
                    <SelectItem value="0" disabled>
                      회장으로 등록된 동아리가 없습니다
                    </SelectItem>
                  ) : (
                    myClubs.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.hostClubId && (
                <p className="text-xs text-destructive">{form.formState.errors.hostClubId.message}</p>
              )}
            </div>

            {type === 'INTER_CLUB' && (
              <div className="space-y-2">
                <Label>파트너 동아리</Label>
                <Select
                  onValueChange={(v) =>
                    form.setValue('partnerClubId', Number(v), { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="합동할 다른 동아리" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerCandidates.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.partnerClubId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.partnerClubId.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input id="title" {...form.register('title')} placeholder="예: 송도 24시간 무박 해커톤" />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposalMessage">행사 설명</Label>
              <Textarea
                id="proposalMessage"
                rows={4}
                placeholder="예: 인하대 멋사랑 인천대 동아리가 6월 중순에 합동 해커톤 하고 싶어. 24시간 무박, 송도 쪽이면 좋겠음"
                {...form.register('proposalMessage')}
              />
              {form.formState.errors.proposalMessage && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.proposalMessage.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: '/events' })}>
                취소
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? '생성 중…' : '다음 단계'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
