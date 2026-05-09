import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { Toaster } from '@/shared/ui'
import type { QueryClient } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'

interface RouterContext {
  queryClient: QueryClient
}

const Devtools = import.meta.env.PROD
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
    <div className="min-h-full bg-background text-foreground">
      <Outlet />
      <Toaster richColors closeButton />
      <Suspense>
        <Devtools />
      </Suspense>
    </div>
  )
}
