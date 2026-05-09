import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import { useAuthStore } from '@/features/auth'
import type { UserRole } from '@/shared/api/types'
import './styles/globals.css'
import './bones/registry'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

const ROLE_ID: Record<UserRole, number> = { SUPER_ADMIN: 100, PRESIDENT: 101, MEMBER: 102 }

/**
 * Boneyard CLI(`npx boneyard-js build`)가 헤드리스 브라우저로 캡처할 때
 * `_authed` 가드에 막히지 않도록 dev에서만 작동하는 auto-login.
 * URL에 ?boneAuth=president|member|super_admin 가 있으면 즉시 mock 인증 주입.
 */
function maybeAutoAuth() {
  if (!import.meta.env.DEV) return
  const raw = new URLSearchParams(window.location.search).get('boneAuth')
  if (!raw) return
  const role = raw.toUpperCase() as UserRole
  if (!(role in ROLE_ID)) return
  if (useAuthStore.getState().isAuthenticated) return

  useAuthStore.getState().setAuth({
    accessToken: `dev-mock-token-${raw.toLowerCase()}`,
    user: {
      id: ROLE_ID[role],
      firebaseUid: `boneyard-${raw.toLowerCase()}`,
      authProvider: 'GOOGLE',
      email: `${raw.toLowerCase()}@boneyard.local`,
      nickname: `bone-${role}`,
      schoolId: 1,
      bio: '',
      role,
    },
  })
}

async function bootstrap() {
  // 백엔드 미준비 환경에서는 MSW로 모든 /api 요청을 인메모리 mock으로 처리.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false') {
    const { worker } = await import('@/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    })
    // eslint-disable-next-line no-console
    console.info('[MSW] mock 활성화 — 실제 백엔드 호출 없음')
  }

  maybeAutoAuth()

  createRoot(rootEl!).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
}

bootstrap()
