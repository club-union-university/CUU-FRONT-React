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
  defaultLoggedInPathForUser,
  useAuthStore,
  useDevMockLogin,
  useLogin,
  redirectIfAuthed,
  userRequiresSignupAfterLogin,
} from '@/features/auth'
import type { UserRole } from '@/shared/api/types'
import {
  isFirebaseConfigured,
  signInWithGoogleIdToken,
} from '@/shared/firebase/app'
import { FirebaseError } from 'firebase/app'

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
    const u = useAuthStore.getState().user
    if (search.redirect && u?.role !== 'SUPER_ADMIN') {
      window.location.href = search.redirect
      return
    }
    navigate({ to: defaultLoggedInPathForUser(u) })
  }

  const handleDevLogin = (opts: { role: UserRole; isNewUser?: boolean }) => {
    devLogin(opts)
    toast.success(opts.isNewUser ? '신규 사용자로 로그인 — 회원가입 진행' : `${opts.role} 데모 로그인`)
    handleAfterLogin(!!opts.isNewUser)
  }

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured()) {
      toast.error('Firebase 환경 변수가 없습니다. .env 에 VITE_FIREBASE_* 를 넣거나 Mock 로그인을 쓰세요.')
      return
    }
    try {
      const idToken = await signInWithGoogleIdToken()
      const data = await login.mutateAsync(idToken)
      const needsSignup = userRequiresSignupAfterLogin(data.isNewUser, data.user)
      toast.success(needsSignup ? '프로필 정보를 완료해 주세요' : '로그인되었습니다')
      handleAfterLogin(needsSignup)
    } catch (err) {
      if (err instanceof FirebaseError && err.code === 'auth/popup-closed-by-user') {
        return
      }
      const message =
        err instanceof FirebaseError ? err.message : err instanceof Error ? err.message : '로그인에 실패했습니다'
      toast.error(message)
    }
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
          {import.meta.env.DEV && (
            <>
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
            </>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          경인권 화이트리스트 학교 이메일만 가입 가능합니다.
        </CardFooter>
      </Card>
    </main>
  )
}
