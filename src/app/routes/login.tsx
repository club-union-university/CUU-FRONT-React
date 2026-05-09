import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  toast,
} from '@/shared/ui'
import {
  DEFAULT_LOGGED_IN_PATH,
  useDevMockLogin,
  useLogin,
  redirectIfAuthed,
} from '@/features/auth'
import type { UserRole } from '@/shared/api/types'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: () => redirectIfAuthed(),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const login = useLogin()
  const devLogin = useDevMockLogin()

  const handleAfterLogin = (isNewUser: boolean) => {
    if (isNewUser) {
      navigate({ to: '/signup' })
      return
    }
    if (search.redirect) {
      window.location.href = search.redirect
      return
    }
    navigate({ to: DEFAULT_LOGGED_IN_PATH })
  }

  const handleDevLogin = (opts: { role: UserRole; isNewUser?: boolean }) => {
    devLogin(opts)
    toast.success(opts.isNewUser ? '신규 사용자로 로그인 — 회원가입 진행' : `${opts.role} 데모 로그인`)
    handleAfterLogin(!!opts.isNewUser)
  }

  const handleGoogleLogin = async () => {
    // P1: Firebase Auth SDK 연동. 지금은 placeholder.
    toast.error('Firebase Auth 미설정 — Mock 로그인을 사용하세요')
  }

  return (
    <main className="container flex min-h-screen max-w-md items-center justify-center py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>학교 이메일로 인증한 Google 계정으로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={login.isPending}
          >
            Google로 계속하기
          </Button>
          <div className="relative py-2 text-center text-xs uppercase text-muted-foreground">
            <span className="bg-card px-2">개발 모드 — 화면 분기 검증용</span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleDevLogin({ role: 'PRESIDENT' })}
          >
            Mock · 회장 (PRESIDENT)
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleDevLogin({ role: 'MEMBER' })}
          >
            Mock · 부원 (MEMBER)
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleDevLogin({ role: 'SUPER_ADMIN' })}
          >
            Mock · 관리자 (SUPER_ADMIN)
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => handleDevLogin({ role: 'MEMBER', isNewUser: true })}
          >
            Mock · 신규 사용자 (회원가입 흐름)
          </Button>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          경인권 화이트리스트 학교 이메일만 가입 가능합니다.
        </CardFooter>
      </Card>
    </main>
  )
}
