import type { ReactNode } from 'react'
import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="container flex h-12 items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-lg px-1 py-0.5 text-foreground outline-none ring-offset-background transition-colors hover:bg-primary-soft/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <CuuLogo />
          </Link>
          <nav className="flex flex-1 flex-wrap items-center justify-end gap-1.5 text-sm font-medium">
            <MainNavLink to="/clubs">동아리</MainNavLink>
            <MainNavLink to="/events">행사</MainNavLink>
            <MainNavLink to="/schools">학교</MainNavLink>
            {isSuperAdmin && (
              <MainNavLink to="/admin/clubs" className="inline-flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                관리자
              </MainNavLink>
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

function MainNavLink({
  to,
  className,
  children,
}: {
  to: '/clubs' | '/events' | '/schools' | '/admin/clubs'
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        'rounded-lg px-3 py-2 text-muted-foreground',
        'transition-[background-color,color,box-shadow] duration-normal ease-out-expo',
        'hover:bg-primary-soft/55 hover:text-foreground',
        className,
      )}
      activeProps={{
        className:
          'bg-primary-soft px-3 py-2 font-semibold text-primary-soft-foreground shadow-xs hover:bg-primary-soft hover:text-primary-soft-foreground',
      }}
    >
      {children}
    </Link>
  )
}
