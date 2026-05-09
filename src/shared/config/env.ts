/**
 * API_BASE_URL은 axios baseURL 로 쓰이며 `/auth`, `/clubs` 등 prefix 와 붙는다.
 * 기본값 `/api` → 예: `/api/auth/login`
 * 다른 호스트면 절대 URL + `/api` 까지: `https://cuu-back-spring-production.up.railway.app/api`
 *
 * - dev: vite proxy `/api→localhost` 또는 MSW
 * - prod: Vercel 등에서는 VITE_API_BASE_URL / VITE_USE_MOCKS 로 실 API 연결
 */
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  FIREBASE: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  },
} as const
