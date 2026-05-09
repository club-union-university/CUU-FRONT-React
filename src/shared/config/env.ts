/**
 * API_BASE_URL은 같은 origin 기준 상대 경로(`/api`)를 기본값으로 둔다.
 *  - dev: vite.config의 proxy(`/api → localhost:8080`) 또는 MSW가 가로챔
 *  - prod (Vercel): 같은 origin이라 MSW service worker가 정상 가로챔.
 *    실 백엔드가 다른 도메인이면 Vercel env vars 의 VITE_API_BASE_URL 로 덮어씀.
 */
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  FIREBASE: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  },
} as const
