import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { requireAuth, useAuthStore, useLogout } from '@/features/auth'
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ location }) => requireAuth(location.pathname),
  component: AuthedLayout,
})

function AuthedLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()

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
            {user?.role === 'SUPER_ADMIN' && (
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
                  {user?.nickname ?? '사용자'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
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
