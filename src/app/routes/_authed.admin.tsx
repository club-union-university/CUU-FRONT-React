import { useRef, useState } from 'react'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Button,
  type ImperativePanelHandle,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import { requireSuperAdmin } from '@/features/auth'

const ADMIN_PANEL_GROUP_ID = 'cuu-admin-shell'

export const Route = createFileRoute('/_authed/admin')({
  beforeLoad: ({ location }) => requireSuperAdmin(location.pathname),
  component: AdminLayout,
})

function AdminLayout() {
  const sidebarRef = useRef<ImperativePanelHandle>(null)
  /** 접힘일 때 레일만 보여 줄지 (패널 너비와 맞춤) */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-[calc(100vh-3rem)]">
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={ADMIN_PANEL_GROUP_ID}
        onLayout={(sizes) => {
          const first = sizes[0]
          setSidebarCollapsed(typeof first === 'number' && first <= 5.5)
        }}
      >
        <ResizablePanel
          ref={sidebarRef}
          collapsible
          collapsedSize={3.25}
          defaultSize={20}
          minSize={14}
          maxSize={32}
          className="border-r border-border bg-muted/30"
          onCollapse={() => setSidebarCollapsed(true)}
          onExpand={() => setSidebarCollapsed(false)}
        >
          {sidebarCollapsed ? (
            <CollapsedAdminRail
              onExpand={() => {
                sidebarRef.current?.expand()
              }}
            />
          ) : (
            <AdminSidebar
              onCollapse={() => {
                sidebarRef.current?.collapse()
              }}
            />
          )}
        </ResizablePanel>
        <ResizableHandle withHandle className={cn(sidebarCollapsed && 'opacity-60')} />
        <ResizablePanel defaultSize={80} minSize={48} className="min-w-0 overflow-y-auto">
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

function CollapsedAdminRail({ onExpand }: { onExpand: () => void }) {
  return (
    <div className="flex h-full w-full flex-col items-center pt-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0 border-border shadow-none"
        onClick={onExpand}
        aria-label="관리 메뉴 펼치기"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function AdminSidebar({ onCollapse }: { onCollapse: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-0.5 p-2">
      <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Super Admin
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onCollapse}
          aria-label="메뉴 접기"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <SidebarLink to="/admin/clubs" label="동아리 관리" />
      <div className="flex-1" />
      <p className="border-t border-border px-2 py-2 text-[11px] text-muted-foreground">
        드래그 핸들로 너비를 조절할 수 있습니다.
      </p>
    </nav>
  )
}

function SidebarLink({ to, label }: { to: '/admin/clubs'; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: 'border-l-2 border-primary bg-muted/70 font-medium text-foreground' }}
      inactiveProps={{ className: 'border-l-2 border-transparent' }}
      className={cn(
        'block rounded-sm py-2 pl-2 pr-2 text-sm text-muted-foreground transition-colors',
        'hover:bg-muted/50 hover:text-foreground',
      )}
    >
      {label}
    </Link>
  )
}
