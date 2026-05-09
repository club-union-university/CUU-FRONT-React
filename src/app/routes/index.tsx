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
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-background to-background"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-10%] top-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-indigo-200/40 blur-3xl"
        />
        <div className="container max-w-5xl py-20 sm:py-28">
          <Badge className="mb-5">경인권 연합동아리 플랫폼</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            동아리 운영,
            <br />
            <span className="text-primary">자연어 한 줄</span>부터.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            한 줄 자연어를 입력하면 AI가 행사를 정제하고, 다중 노출 슬롯으로 다른 학교에까지
            자동으로 흘려보냅니다. 회장이 카톡·노션·구글폼을 떠도는 시간을 모두 회수합니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthed ? (
              <Button asChild size="lg">
                <Link to="/clubs">
                  동아리 둘러보기 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/login">
                  시작하기 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <Link to="/clubs">데모 보기</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 border-t pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">
                  {s.value}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {s.suffix}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container max-w-5xl pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    indigo: 'bg-indigo-50 text-indigo-700',
    pink: 'bg-pink-50 text-pink-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  }[tone]
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <div
          className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg ${toneCls}`}
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
