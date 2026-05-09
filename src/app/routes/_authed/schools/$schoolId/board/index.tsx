import { createFileRoute } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'
import { Badge } from '@/shared/ui'
import { useSchool } from '@/features/school'
import { PostBoard } from '@/features/post'

export const Route = createFileRoute('/_authed/schools/$schoolId/board/')({
  component: SchoolBoardPage,
})

function SchoolBoardPage() {
  const { schoolId } = Route.useParams()
  const id = Number(schoolId)
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: school } = useSchool(id)

  return (
    <main className="container max-w-4xl py-10">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            {school?.name ?? '학교'} · 게시판
          </h1>
          <Badge variant="outline" className="ml-2">
            read-only
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          이 학교 행사들의 다중 노출 슬롯입니다. 모든 학교 학생이 read-only로 열람할 수 있습니다.
        </p>
      </header>
      <PostBoard
        boardType="SCHOOL"
        targetId={id}
        readOnly
        category={search.category}
        onCategoryChange={(c) => navigate({ search: { category: c } })}
      />
    </main>
  )
}
