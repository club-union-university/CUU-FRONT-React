import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ShieldCheck, Building2 } from 'lucide-react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui'
import { cn } from '@/lib/utils'
import { requireSuperAdmin } from '@/features/auth'

export const Route = createFileRoute('/_authed/admin')({
  beforeLoad: ({ location }) => requireSuperAdmin(location.pathname),
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="h-[calc(100vh-56px)]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={20}
          minSize={14}
          maxSize={32}
          className="border-r bg-muted/30"
        >
          <AdminSidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80} className="overflow-y-auto">
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

function AdminSidebar() {
  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-3 flex items-center gap-2 px-2 py-1.5 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Super Admin
      </div>
      <SidebarLink to="/admin/clubs" icon={Building2} label="동아리 관리" />
      {/* P1: <SidebarLink to="/admin/users" icon={Users} label="사용자 관리" /> */}
      {/* P1: <SidebarLink to="/admin/schools" icon={GraduationCap} label="학교 화이트리스트" /> */}
    </nav>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
}: {
  to: '/admin/clubs'
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: 'bg-primary/10 text-primary font-medium' }}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors',
        'hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}
