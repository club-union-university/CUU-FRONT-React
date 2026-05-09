import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  toast,
} from '@/shared/ui'
import {
  DEFAULT_LOGGED_IN_PATH,
  requireAuth,
  useAuthStore,
  useUpdateMe,
  userRoleLabel,
} from '@/features/auth'
import { formatSchoolDisplayName, useSchool } from '@/features/school'

export const Route = createFileRoute('/_authed/profile')({
  beforeLoad: ({ location }) => requireAuth(location.pathname),
  component: ProfilePage,
})

const schema = z.object({
  nickname: z.string().min(2, '닉네임 2자 이상').max(20),
  profileImage: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(200).optional(),
})

type FormValues = z.infer<typeof schema>

function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const update = useUpdateMe()
  const schoolId = user?.schoolId && user.schoolId > 0 ? user.schoolId : 0
  const schoolQ = useSchool(schoolId)
  const schoolLabel = schoolQ.data?.name ?? formatSchoolDisplayName(user?.schoolId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nickname: user?.nickname ?? '',
      profileImage: user?.profileImage ?? '',
      bio: user?.bio ?? '',
    },
  })

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await update.mutateAsync({
        nickname: v.nickname,
        profileImage: v.profileImage || undefined,
        bio: v.bio || undefined,
      })
      toast.success('프로필 저장 완료')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장 실패')
    }
  })

  return (
    <main className="container max-w-2xl py-10">
      <header className="mb-6 flex items-center gap-4">
        <Avatar seed={user?.id} name={user?.nickname || 'U'} size={56} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user?.nickname || '사용자'}</h1>
          <p className="mt-1 text-sm font-medium text-foreground">{schoolLabel}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{user?.email}</span>
            {user?.role && <Badge variant="secondary">{userRoleLabel(user.role)}</Badge>}
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">프로필 편집</CardTitle>
          <CardDescription>
            닉네임은 동아리 부원 / 행사 참여자 화면에서 보이는 이름입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input id="nickname" {...form.register('nickname')} />
              {form.formState.errors.nickname && (
                <p className="text-xs text-destructive">{form.formState.errors.nickname.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImage">프로필 이미지 URL (선택)</Label>
              <Input id="profileImage" placeholder="https://..." {...form.register('profileImage')} />
              {form.formState.errors.profileImage && (
                <p className="text-xs text-destructive">유효한 URL을 입력하세요</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">자기소개 (선택)</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="간단한 자기소개"
                {...form.register('bio')}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: DEFAULT_LOGGED_IN_PATH })}>
                취소
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? '저장 중…' : '저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
