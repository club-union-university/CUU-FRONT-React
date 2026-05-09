import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Megaphone, ShieldCheck, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  CrewLogo,
} from '@/shared/ui'
import { useAuthStore } from '@/features/auth'
import { useClubs } from '@/features/club'
import { useEvents } from '@/features/event'
import { useSchools } from '@/features/school'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  const { data: schools } = useSchools({ region: 'GYEONGIN', whitelistedOnly: true })
  const { data: clubs } = useClubs({ status: 'APPROVED' })
  const { data: events } = useEvents({})

  const stats = [
    { label: '경인권 학교', value: schools?.length ?? 0, suffix: '개교' },
    { label: '승인 동아리', value: clubs?.length ?? 0, suffix: '개' },
    { label: '진행 행사', value: events?.length ?? 0, suffix: '건' },
  ]

  return (
    <main>
      {/* Top thin bar — 시그니처 액센트 */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-brand-mesh" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
        />

        <div className="container relative max-w-5xl py-20 sm:py-28">
          <header className="mb-10 flex items-center justify-between">
            <CrewLogo className="text-foreground" />
            {!isAuthed && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">로그인</Link>
              </Button>
            )}
          </header>

          <div className="animate-fade-in-up [animation-delay:60ms]">
            <Badge
              variant="outline"
              className="mb-5 border-primary/30 bg-primary-soft text-primary-soft-foreground"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              경인권 연합동아리 플랫폼 · v1.0
            </Badge>
            <h1 className="text-display-lg sm:text-display-xl">
              동아리 운영,
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                자연어 한 줄
              </span>
              부터.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              한 줄 자연어를 입력하면 AI가 행사를 정제하고, 다중 노출 슬롯으로 다른 학교에까지
              자동으로 흘려보냅니다. 회장이 카톡·노션·구글폼을 떠도는 시간을 모두 회수합니다.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {isAuthed ? (
                <Button asChild size="xl">
                  <Link to="/clubs">
                    동아리 둘러보기 <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="xl">
                  <Link to="/login">
                    시작하기 <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="xl">
                <Link to="/clubs">데모 보기</Link>
              </Button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-6 border-t pt-8 animate-fade-in-up [animation-delay:200ms]">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">
                  {s.value}
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    {s.suffix}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-sunken/30">
        <div className="container max-w-5xl py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-primary">
            How it works
          </p>
          <h2 className="text-display tracking-tight">세 가지 약속.</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            3분 안에 행사가 나오고, 5곳에 자동으로 퍼지고, 사칭은 끝까지 막아 드립니다.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Sparkles}
              title="자연어 위저드"
              description="한 줄 입력 → Gemini가 제목·카테고리·장소·공지글까지 자동 정제. 3-step 위저드로 교내·연합 행사를 만든다."
              tone="indigo"
            />
            <FeatureCard
              icon={Megaphone}
              title="다중 노출 발행"
              description="교내 3곳 / 연합 5곳 게시판에 동시 발행. 다른 학교 학생도 read-only로 열람 — 정보 비대칭이 자가 해소된다."
              tone="pink"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="검증된 동아리만"
              description="관리자가 등록 신청을 검토합니다. 사칭·유령 동아리를 차단해 신뢰도를 유지."
              tone="emerald"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  tone: 'indigo' | 'pink' | 'emerald'
}) {
  const toneCls = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    pink: 'bg-pink-50 text-pink-700 ring-pink-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  }[tone]
  return (
    <Card className="hover-lift group">
      <CardHeader>
        <div
          className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ${toneCls}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
