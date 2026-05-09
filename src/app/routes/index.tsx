import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ClipboardList, Megaphone, ShieldCheck } from 'lucide-react'
import { Button, CrewLogo } from '@/shared/ui'
import { useAuthStore } from '@/features/auth'
import { useClubs } from '@/features/club'
import { useEvents } from '@/features/event'
import { useSchools } from '@/features/school'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

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
    { label: '등록 학교', value: schools?.length ?? 0, suffix: '곳' },
    { label: '승인 동아리', value: clubs?.length ?? 0, suffix: '개' },
    { label: '행사', value: events?.length ?? 0, suffix: '건' },
  ]

  return (
    <main className="min-h-screen">
      <div className="border-b bg-background">
        <div className="container max-w-3xl py-12 sm:py-16">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-8">
            <CrewLogo className="text-foreground" />
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

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">경인권 연합 동아리 · 안내 운영</p>
            <h1 className="text-display-lg font-bold tracking-tight sm:text-display-xl">
              행사 공지와 모집을
              <br />
              여기서 마무리합니다.
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              초안 → 세부 입력 → 교차 게시 순으로만 진행하게 두었습니다. 회장 단톡·문서 여러 개에
              같은 말 반복하지 않도록, 노출 형식을 플랫폼 안에서 맞춥니다.
            </p>

            <div className="flex flex-wrap gap-2 pt-4">
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

          <div className="mt-12 rounded-md border">
            <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {stats.map((s) => (
                <div key={s.label} className="px-4 py-3 sm:py-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">
                    {s.value}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">{s.suffix}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="border-b bg-muted/20">
        <div className="container max-w-3xl py-12 sm:py-14">
          <h2 className="text-lg font-semibold tracking-tight">운영 원칙</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            작성은 단계로 나누고, 교차 업로드는 같은 출처만 쓰고, 가입·등록은 관리 화면에서 걸러냅니다.
          </p>

          <ol className="mt-10 space-y-0 border-t">
            {features.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="flex gap-4 border-b py-6 last:border-b-0 sm:gap-5"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border bg-background text-sm font-medium text-muted-foreground"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <h3 className="font-semibold leading-snug">{title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  )
}
