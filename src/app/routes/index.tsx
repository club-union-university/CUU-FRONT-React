import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ClipboardList, Megaphone, ShieldCheck } from 'lucide-react'
import { Button, CuuLogo } from '@/shared/ui'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/auth'
import { useClubs } from '@/features/club'
import { useEvents } from '@/features/event'
import { useSchools } from '@/features/school'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const workflowSteps = ['초안', '세부 입력', '교차 게시'] as const

const features = [
  {
    icon: ClipboardList,
    title: '단계별 초안',
    body: '제목·분류부터 장소·공지 초안까지 3단계로 나눕니다. 교내·연합 모두 같은 흐름입니다.',
  },
  {
    icon: Megaphone,
    title: '한 번에 맞춘 게시',
    body: '여러 교내 게시판과 연합 채널에 동일한 행사 안내를 정리합니다. 타교는 읽기 전용입니다.',
  },
  {
    icon: ShieldCheck,
    title: '검증된 동아리',
    body: '관리자 검토 후 등록됩니다. 단체 허위·유령 계정으로 공지 신뢰도를 깎지 않도록 합니다.',
  },
] as const

function LandingPage() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  const { data: schools } = useSchools({ region: 'GYEONGIN', whitelistedOnly: true })
  const { data: clubs } = useClubs({ status: 'APPROVED' })
  const { data: events } = useEvents({})

  const stats = [
    { label: '등록 학교', value: schools?.length ?? 0, suffix: '곳', emphasis: true as const },
    { label: '승인 동아리', value: clubs?.length ?? 0, suffix: '개', emphasis: false as const },
    { label: '행사', value: events?.length ?? 0, suffix: '건', emphasis: false as const },
  ]

  return (
    <main className="min-h-screen">
      {/* —— Hero —— */}
      <section className="relative border-b border-border bg-background">
        <div className="pointer-events-none absolute inset-0 landing-hero-backdrop" aria-hidden />

        <div className="container relative max-w-6xl px-4 py-14 sm:py-16 lg:py-20">
          <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
            <CuuLogo className="text-foreground" />
            {!isAuthed ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">로그인</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/clubs">목록으로</Link>
              </Button>
            )}
          </header>
          <div className="section-flow-divider mb-12 shrink-0" aria-hidden />

          <div className="grid items-start gap-12 lg:grid-cols-[1fr,minmax(272px,340px)] lg:gap-16">
            {/* 왼쪽: 카피 + CTA */}
            <div className="space-y-6">
              <p className="motion-safe:animate-fade-in-up border-l-2 border-foreground/20 pl-3 text-[13px] font-semibold tracking-wide text-muted-foreground">
                경인권 연합 · CUU
              </p>

              <h1 className="motion-safe:animate-fade-in-up motion-safe:[animation-delay:40ms] font-bold tracking-tight text-foreground">
                <span className="block text-[clamp(1.75rem,4vw,2.35rem)] leading-[1.15]">
                  행사 공지와 모집을
                </span>
                <span className="mt-2 block text-[clamp(2rem,5vw,2.85rem)] leading-[1.12]">
                  여기서&nbsp;
                  <span className="decoration-primary/35 underline decoration-2 underline-offset-[0.22em]">
                    마무리합니다.
                  </span>
                </span>
              </h1>

              <p className="motion-safe:animate-fade-in-up motion-safe:[animation-delay:90ms] max-w-lg text-[15px] leading-[1.75] text-muted-foreground sm:text-base">
                같은 내용을 단톡·문서·게시판에 여러 번 쓰지 않도록, 흐름을 한곳으로 모았습니다. 노출 형식만
                맞추면 교차 게시까지 이어집니다.
              </p>

              <div
                className="motion-safe:animate-fade-in-up motion-safe:[animation-delay:140ms] flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/45 px-3 py-2.5 text-sm text-muted-foreground shadow-xs"
                aria-label="진행 순서"
              >
                <span className="font-medium text-foreground">흐름</span>
                {workflowSteps.map((step, i) => (
                  <span key={step} className="inline-flex items-center gap-2">
                    {i > 0 && (
                      <span className="text-muted-foreground/60" aria-hidden>
                        ⟶
                      </span>
                    )}
                    <span className="rounded-md bg-background px-2 py-0.5 text-[13px] font-medium text-foreground shadow-xs">
                      {step}
                    </span>
                  </span>
                ))}
              </div>

              <div className="motion-safe:animate-fade-in-up motion-safe:[animation-delay:190ms] flex flex-wrap gap-3 pt-2">
                {isAuthed ? (
                  <Button asChild size="lg">
                    <Link to="/clubs">
                      동아리 <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link to="/login">
                      시작 <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg">
                  <Link to="/clubs">행사 보기</Link>
                </Button>
              </div>
            </div>

            {/* 오른쪽: 수치 패널 (스택 + 강조) */}
            <div className="flex flex-col gap-3 lg:sticky lg:top-8">
              <p className="text-[12px] font-semibold tracking-wide text-muted-foreground motion-safe:animate-fade-in-up motion-safe:[animation-delay:220ms]">
                지금 규모
              </p>
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  style={{ animationDelay: `${240 + i * 50}ms` }}
                  className={cn(
                    'motion-safe:animate-fade-in-up rounded-xl border border-border/65 bg-card px-5 py-4 shadow-xs transition-[box-shadow,border-color] duration-normal ease-out-expo hover:shadow-sm',
                    s.emphasis
                      ? 'border-border ring-1 ring-primary/18 hover:border-border'
                      : 'hover:border-border',
                  )}
                >
                  <p className="text-[13px] text-muted-foreground">{s.label}</p>
                  <p className="mt-1 flex items-baseline gap-1.5 tabular-nums">
                    <span className="text-3xl font-semibold tracking-tight">{s.value}</span>
                    <span className="text-sm font-normal text-muted-foreground">{s.suffix}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* —— 운영 원칙 —— */}
      <section className="border-b border-border bg-muted/25 dark:bg-muted/15">
        <div className="container max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
            <div className="lg:sticky lg:top-10 lg:self-start">
              <h2 className="text-xl font-semibold tracking-tight">운영 원칙</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                작성은 단계로 나누고, 교차 업로드는 같은 출처만 쓰고, 가입·등록은 관리 화면에서
                걸러냅니다.
              </p>
              <div className="mt-8 hidden h-16 w-px bg-border lg:block" aria-hidden />
            </div>

            <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border/65 bg-card shadow-xs transition-shadow duration-normal ease-out-expo hover:shadow-sm">
              {features.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="flex gap-5 bg-card px-5 py-6 sm:gap-6 sm:px-7 sm:py-8">
                  <div className="flex shrink-0 items-start gap-2 pt-1 sm:flex-col sm:items-center sm:gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted text-sm font-bold tabular-nums text-foreground shadow-xs"
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground sm:mt-0.5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold leading-snug">{title}</h3>
                    <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* —— 마무리 띠 —— */}
      <footer className="border-t border-border bg-background py-10">
        <div className="container flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">CUU</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Club Union University</p>
            <p className="mt-2 text-sm text-muted-foreground">
              로그인 후 동아리·행사·학교 목록과 관리 기능을 이용할 수 있습니다.
            </p>
          </div>
          <Button asChild variant="secondary">
            {!isAuthed ? <Link to="/login">로그인 또는 시작</Link> : <Link to="/events">행사 목록</Link>}
          </Button>
        </div>
      </footer>
    </main>
  )
}
