import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/shared/ui'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 flex flex-col items-start gap-4">
        <Badge tone="brand">경인권 연합동아리 플랫폼</Badge>
        <h1 className="text-4xl font-bold tracking-tight text-(--color-fg-default) sm:text-5xl">
          Crew
        </h1>
        <p className="max-w-2xl text-lg text-(--color-fg-muted)">
          자연어 한 줄 → 3-step 위저드 → 다중 노출 자동 발행. 회장이 행사를 만들고, 부원이 자동으로
          모이고, 다른 학교까지 정보가 흘러간다.
        </p>
        <div className="flex gap-3">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-md bg-(--color-brand) px-6 text-base font-medium text-(--color-fg-on-brand) hover:bg-(--color-brand-hover)"
          >
            시작하기
          </Link>
          <Button variant="outline" size="lg">
            데모 보기
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>자연어 위저드</CardTitle>
            <CardDescription>
              한 줄 입력 → Gemini가 제목/카테고리/장소/공지글까지 자동 정제.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-(--color-fg-muted)">
            교내·연합 행사를 3-step으로 만든다.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>다중 노출 자동 발행</CardTitle>
            <CardDescription>
              교내 3곳 / 연합 5곳 게시판에 동시에 발행. 다른 학교 학생도 read-only 열람.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-(--color-fg-muted)">
            정보 비대칭이 자가 해소된다.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>역할 기반 매칭</CardTitle>
            <CardDescription>
              디자이너/프론트/백엔드 역할 선언 → 행사 모집 시 자동 매칭.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-(--color-fg-muted)">
            사람이 아니라 동아리를 매칭한다. 사람은 따라온다.
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
