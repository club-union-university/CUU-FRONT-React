import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import './styles/globals.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

async function bootstrap() {
  // 백엔드 미준비 환경에서는 MSW로 모든 /api 요청을 인메모리 mock으로 처리.
  // VITE_USE_MOCKS=false 또는 PROD에서는 자동으로 비활성.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false') {
    const { worker } = await import('@/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    })
    // eslint-disable-next-line no-console
    console.info('[MSW] mock 활성화 — 실제 백엔드 호출 없음')
  }

  createRoot(rootEl!).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
}

bootstrap()
