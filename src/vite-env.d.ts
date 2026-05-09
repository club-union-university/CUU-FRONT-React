/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCKS?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  /** `true` 일 때 프로필에 백엔드 테스트용 역할 전환 UI 노출 (PATCH /users/me/role/...) */
  readonly VITE_ENABLE_ROLE_SWITCH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
