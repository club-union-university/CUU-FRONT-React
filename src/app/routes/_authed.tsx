import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import {
  Avatar,
  Badge,
  Button,
  CuuLogo,
  DarkModeToggle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { requireAuth, useAuthStore, useLogout, userRoleLabel } from '@/features/auth'
import { NotificationBell } from '@/features/notification'
import { LogOut, ShieldCheck, UserCog } from 'lucide-react'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ location }) => requireAuth(location.pathname),
  component: AuthedLayout,
})

function AuthedLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isPresident = user?.role === 'PRESIDENT'

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-muted/25">
        <div className="container flex h-12 items-center justify-between gap-4">
          <Link to="/" className="text-foreground">
            <CuuLogo />
          </Link>
          <nav className="flex flex-1 flex-wrap items-center justify-end gap-1 text-sm">
            <Link
              to="/clubs"
              className="rounded-sm px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              동아리
            </Link>
            <Link
              to="/events"
              className="rounded-sm px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              행사
            </Link>
            <Link
              to="/schools"
              className="rounded-sm px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              학교
            </Link>
            {isSuperAdmin && (
              <Link
                to="/admin/clubs"
                className="inline-flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" /> 관리자
              </Link>
            )}
            <NotificationBell />
            <DarkModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 pl-1.5">
                  <Avatar seed={user?.id} name={user?.nickname || 'U'} size={24} />
                  <span className="max-w-[80px] truncate">{user?.nickname || '사용자'}</span>
                  {user?.role && (
                    <Badge
                      variant={isSuperAdmin ? 'destructive' : isPresident ? 'default' : 'secondary'}
                      className="ml-1 px-1.5 py-0 text-[10px] font-normal"
                    >
                      {userRoleLabel(user.role)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{user?.nickname}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  <UserCog className="mr-2 h-4 w-4" /> 프로필 편집
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    navigate({ to: '/login' })
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> 로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
