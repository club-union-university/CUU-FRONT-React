import { createFileRoute, Link } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui'
import { useSchools } from '@/features/school'

export const Route = createFileRoute('/_authed/schools/')({
  component: SchoolsListPage,
})

function SchoolsListPage() {
  const { data: schools, isLoading } = useSchools({ region: 'GYEONGIN', whitelistedOnly: true })

  return (
    <main className="container max-w-5xl py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">학교 게시판</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          경인권 화이트리스트 학교의 행사를 둘러보세요. 다른 학교 행사도 read-only로 열람할 수 있습니다.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      ) : !schools?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            등록된 학교가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((s) => (
            <Link
              key={s.id}
              to="/schools/$schoolId/board"
              params={{ schoolId: String(s.id) }}
              className="block transition-transform hover:-translate-y-0.5"
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                  </div>
                  <CardDescription>{s.emailDomain}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Badge variant="secondary">{s.region}</Badge>
                  {s.campusType && <Badge variant="outline">{s.campusType}</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
