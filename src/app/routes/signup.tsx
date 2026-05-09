import { useEffect, useMemo } from 'react'
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
  Textarea,
  toast,
} from '@/shared/ui'
import {
  defaultLoggedInPathForUser,
  useSignup,
  useAuthStore,
  useLogout,
  requireSignupIncomplete,
} from '@/features/auth'
import { matchSchoolByEmail, useSchool, useSchools } from '@/features/school'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ location }) => requireSignupIncomplete(location.pathname),
  component: SignupPage,
})

const signupSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상').max(20),
  schoolId: z.coerce.number().int().positive('학교를 로그인 이메일로 확인할 수 없습니다'),
  bio: z.string().max(200).optional(),
})

type FormValues = z.infer<typeof signupSchema>

function SignupPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signup = useSignup()
  const logout = useLogout()
  const schoolIdHint = user?.schoolId && user.schoolId > 0 ? user.schoolId : 0
  const schoolsQ = useSchools({ whitelistedOnly: true })
  const schoolByIdQ = useSchool(schoolIdHint)

  const resolvedSchool = useMemo(() => {
    if (!user) return undefined
    if (schoolIdHint > 0) {
      if (schoolByIdQ.isPending) return undefined
      if (schoolByIdQ.data) return schoolByIdQ.data
    }
    if (schoolsQ.isPending) return undefined
    return matchSchoolByEmail(schoolsQ.data ?? [], user.email)
  }, [
    user,
    schoolIdHint,
    schoolByIdQ.isPending,
    schoolByIdQ.data,
    schoolsQ.isPending,
    schoolsQ.data,
  ])

  const schoolFieldsPending =
    schoolIdHint > 0 ? schoolByIdQ.isPending : schoolsQ.isPending

  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nickname: user?.nickname?.trim() ?? '',
      schoolId: resolvedSchool?.id ?? 0,
      bio: user?.bio?.trim() ?? '',
    },
  })

  useEffect(() => {
    if (!user) return
    form.reset({
      nickname: user.nickname?.trim() ?? '',
      schoolId: resolvedSchool?.id ?? 0,
      bio: user.bio?.trim() ?? '',
    })
  }, [user, resolvedSchool?.id, form.reset])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signup.mutateAsync(values)
      toast.success('회원가입 완료')
      navigate({ to: defaultLoggedInPathForUser(useAuthStore.getState().user) })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '가입 실패')
    }
  })

  return (
    <main className="container max-w-xl py-16">
      <Card>
        <CardHeader>
          <CardTitle>프로필 완료</CardTitle>
          <CardDescription>
            학교는 <strong className="text-foreground">로그인 이메일 도메인</strong>으로 정해집니다. 닉네임과 소개를
            저장합니다.
          </CardDescription>
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
              <Label>소속 학교</Label>
              {schoolFieldsPending ? (
                <p className="text-sm text-muted-foreground">학교 정보를 불러오는 중…</p>
              ) : schoolsQ.isError ? (
                <div className="space-y-3 rounded-lg border border-destructive/35 bg-destructive/5 p-4 text-sm">
                  <p className="font-medium text-destructive">학교 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
                </div>
              ) : !resolvedSchool ? (
                <div className="space-y-3 rounded-lg border border-destructive/35 bg-destructive/5 p-4 text-sm">
                  <p className="font-medium text-destructive">
                    로그인한 이메일이 CUU 화이트리스트 학교 도메인과 일치하지 않습니다.
                  </p>
                  <p className="text-muted-foreground">
                    학교 포털/웹메일 도메인으로 연결된 Google 계정으로 다시 로그인해 주세요. (예: @inha.ac.kr,
                    @inu.ac.kr, @ajou.ac.kr 등 — 서브도메인 가능)
                  </p>
                  {user?.email && (
                    <p className="text-xs text-muted-foreground">
                      현재 로그인: <span className="font-mono text-foreground">{user.email}</span>
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout()
                      navigate({ to: '/login' })
                    }}
                  >
                    로그아웃 후 다시 로그인
                  </Button>
                </div>
              ) : (
                <>
                  <Input readOnly disabled className="bg-muted/50" value={resolvedSchool.name ?? ''} />
                  <p className="text-xs text-muted-foreground">
                    {user?.email ?? '로그인 이메일'} 도메인 기준 자동 선택
                  </p>
                </>
              )}
              {form.formState.errors.schoolId && resolvedSchool && (
                <p className="text-xs text-destructive">{form.formState.errors.schoolId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">자기소개 (선택)</Label>
              <Textarea id="bio" placeholder="간단한 자기소개" rows={3} {...form.register('bio')} />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={signup.isPending || schoolFieldsPending || schoolsQ.isError || !resolvedSchool}
            >
              {signup.isPending ? '가입 중…' : '가입 완료'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
