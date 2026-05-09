import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'

interface RouterContext {
  queryClient: QueryClient
}

const Devtools =
  import.meta.env.PROD
    ? () => null
    : lazy(() =>
        import('@tanstack/router-devtools').then((m) => ({
          default: m.TanStackRouterDevtools,
        })),
      )

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-full bg-(--color-bg-canvas) text-(--color-fg-default)">
      <Outlet />
      <Suspense>
        <Devtools />
      </Suspense>
    </div>
  )
}

// 빌드 시 unused import 경고 방지용 — 실제 사용은 lazy 위에서.
void TanStackRouterDevtools
