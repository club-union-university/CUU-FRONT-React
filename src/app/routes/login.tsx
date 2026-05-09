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
import { useDevMockLogin, useLogin, redirectIfAuthed } from '@/features/auth'

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
    navigate({ to: '/' })
  }

  const handleDevLogin = (isNewUser: boolean) => {
    devLogin({ isNewUser })
    toast.success(isNewUser ? '신규 사용자로 로그인 — 회원가입 진행' : '데모 로그인 완료')
    handleAfterLogin(isNewUser)
  }

  const handleGoogleLogin = async () => {
    // P1: Firebase Auth SDK 연동. 지금은 placeholder.
    // const cred = await signInWithPopup(...)
    // const idToken = await cred.user.getIdToken()
    // const res = await login.mutateAsync(idToken)
    // handleAfterLogin(res.isNewUser)
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
            <span className="bg-card px-2">개발 모드</span>
          </div>
          <Button variant="outline" className="w-full" onClick={() => handleDevLogin(false)}>
            Mock 로그인 (기존 사용자, 회장)
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => handleDevLogin(true)}>
            Mock 로그인 (신규 사용자, 회원가입 흐름)
          </Button>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          경인권 화이트리스트 학교 이메일만 가입 가능합니다.
        </CardFooter>
      </Card>
    </main>
  )
}
