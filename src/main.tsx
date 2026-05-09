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
 * Boneyard CLI 캡처 / Vercel mock 데모용 auto-login.
 * URL에 ?boneAuth=president|member|super_admin 가 있고 VITE_USE_MOCKS 가
 * 활성된 환경에서 즉시 mock 인증 주입. 실 백엔드(VITE_USE_MOCKS=false) 환경
 * 에서는 작동하지 않아 보안 영향 없음.
 */
function maybeAutoAuth() {
  if (import.meta.env.VITE_USE_MOCKS === 'false') return
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
  // prod 빌드(예: Vercel)에서도 VITE_USE_MOCKS=false 가 아니면 활성. 실 백엔드
  // 붙으면 Vercel env에 VITE_USE_MOCKS=false 만 설정해 비활성화.
  if (import.meta.env.VITE_USE_MOCKS !== 'false') {
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
