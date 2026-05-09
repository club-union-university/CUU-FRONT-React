import { env } from '@/shared/config/env'

/** API 기본 URL prefix를 붙여 핸들러 패턴 생성. */
export const API = (path: string) => `${env.API_BASE_URL}${path}`
