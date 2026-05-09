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
import { useCreateClub } from '@/features/club'
import { useSchools } from '@/features/school'
import { requirePresident } from '@/features/auth'
import type { ClubCategory } from '@/shared/api/types'

export const Route = createFileRoute('/_authed/clubs/new')({
  beforeLoad: ({ location }) => requirePresident(location.pathname),
  component: ClubRegisterPage,
})

const categoryOptions: { value: ClubCategory; label: string }[] = [
  { value: 'DEV', label: '개발' },
  { value: 'DESIGN', label: '디자인' },
  { value: 'STARTUP', label: '창업' },
  { value: 'ART', label: '예술' },
  { value: 'SPORTS', label: '스포츠' },
]

const categoryEnum = z.enum(['DEV', 'DESIGN', 'STARTUP', 'ART', 'SPORTS'])

const schema = z.object({
  schoolId: z.coerce.number().int().positive('학교를 선택하세요'),
  name: z.string().min(2, '동아리 이름은 2자 이상').max(40),
  category: categoryEnum,
  description: z.string().max(500).optional(),
  evidenceUrl: z.string().url('실재 증빙 URL을 입력하세요').optional().or(z.literal('')),
})

type Values = z.infer<typeof schema>

function ClubRegisterPage() {
  const navigate = useNavigate()
  const create = useCreateClub()
  const schools = useSchools({ region: 'GYEONGIN', whitelistedOnly: true })
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { schoolId: 0, name: '', description: '', evidenceUrl: '' },
  })

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      const club = await create.mutateAsync({
        schoolId: v.schoolId,
        name: v.name,
        category: v.category,
        description: v.description || undefined,
        evidenceUrl: v.evidenceUrl || undefined,
      })
      toast.success('등록 신청 완료. Super Admin 승인을 기다립니다.')
      navigate({ to: '/clubs/$clubId', params: { clubId: String(club.id) } })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '등록 실패')
    }
  })

  return (
    <main className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>동아리 등록 신청</CardTitle>
          <CardDescription>
            등록 후 Super Admin이 검토합니다. 실재 증빙 자료(공식 SNS, 학교 공지 등)가 있으면 통과율이 높습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>학교</Label>
              <Select
                onValueChange={(v) => form.setValue('schoolId', Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={schools.isLoading ? '학교 불러오는 중…' : '학교 선택'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {schools.data?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.schoolId && (
                <p className="text-xs text-destructive">{form.formState.errors.schoolId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">동아리 이름</Label>
              <Input id="name" {...form.register('name')} placeholder="예: 인하대 멋쟁이사자처럼" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                onValueChange={(v) =>
                  form.setValue('category', v as ClubCategory, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="동아리 카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">소개</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="우리 동아리는 무엇을 하는지"
                {...form.register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceUrl">실재 증빙 URL (선택)</Label>
              <Input id="evidenceUrl" placeholder="https://..." {...form.register('evidenceUrl')} />
              {form.formState.errors.evidenceUrl && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.evidenceUrl.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: '/clubs' })}>
                취소
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? '신청 중…' : '신청'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
