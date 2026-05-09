import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { requireAuth, useAuthStore, useLogout, userRoleLabel } from '@/features/auth'
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react'

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
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">
            Crew
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/clubs" className="text-muted-foreground hover:text-foreground">
              동아리
            </Link>
            <Link to="/events" className="text-muted-foreground hover:text-foreground">
              행사
            </Link>
            {isSuperAdmin && (
              <Link to="/admin/clubs" className="text-muted-foreground hover:text-foreground">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> 관리자
                </span>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>{user?.nickname || '사용자'}</span>
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
