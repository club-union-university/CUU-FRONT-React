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
import { useSignup, requireAuth } from '@/features/auth'
import { useSchools } from '@/features/school'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ location }) => requireAuth(location.pathname),
  component: SignupPage,
})

const signupSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상').max(20),
  schoolId: z.coerce.number().int().positive('학교를 선택하세요'),
  bio: z.string().max(200).optional(),
})

type FormValues = z.infer<typeof signupSchema>

function SignupPage() {
  const navigate = useNavigate()
  const signup = useSignup()
  const schools = useSchools({ region: 'GYEONGIN', whitelistedOnly: true })

  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { nickname: '', schoolId: 0, bio: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signup.mutateAsync(values)
      toast.success('회원가입 완료')
      navigate({ to: '/' })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '가입 실패')
    }
  })

  return (
    <main className="container max-w-xl py-16">
      <Card>
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>닉네임과 학교를 선택해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input id="nickname" placeholder="동아리에서 쓸 닉네임" {...form.register('nickname')} />
              {form.formState.errors.nickname && (
                <p className="text-xs text-destructive">{form.formState.errors.nickname.message}</p>
              )}
            </div>

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
              <Label htmlFor="bio">자기소개 (선택)</Label>
              <Textarea id="bio" placeholder="간단한 자기소개" rows={3} {...form.register('bio')} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={signup.isPending}>
              {signup.isPending ? '가입 중…' : '가입 완료'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
