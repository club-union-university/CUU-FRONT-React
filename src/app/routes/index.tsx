import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@/shared/ui'
import { useAuthStore } from '@/features/auth'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated)

  return (
    <main className="container max-w-5xl py-16">
      <header className="mb-12 flex flex-col items-start gap-4">
        <Badge>경인권 연합동아리 플랫폼</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Crew</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          자연어 한 줄 → 3-step 위저드 → 다중 노출 자동 발행. 회장이 행사를 만들고, 부원이 자동으로
          모이고, 다른 학교까지 정보가 흘러간다.
        </p>
        <div className="flex gap-3">
          {isAuthed ? (
            <Button asChild size="lg">
              <Link to="/clubs">동아리 둘러보기</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/login">시작하기</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg">
            <Link to="/clubs">데모 보기</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">자연어 위저드</CardTitle>
            <CardDescription>
              한 줄 입력 → Gemini가 제목/카테고리/장소/공지글까지 자동 정제.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            교내·연합 행사를 3-step으로 만든다.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">다중 노출 자동 발행</CardTitle>
            <CardDescription>
              교내 3곳 / 연합 5곳 게시판에 동시 발행. 다른 학교 학생도 read-only 열람.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            정보 비대칭이 자가 해소된다.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">검증된 동아리만</CardTitle>
            <CardDescription>
              관리자가 등록 신청을 검토합니다. 사칭/유령 동아리를 차단해 신뢰도를 유지.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            사람이 아니라 동아리를 매칭한다.
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
