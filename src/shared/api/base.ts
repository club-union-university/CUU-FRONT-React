import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { toApiError } from './error'

/**
 * 토큰 공급자 인터페이스.
 * Zustand 스토어에 의존하지 않도록 함수로 주입 — 테스트/SSR 친화적.
 */
export type TokenProvider = () => string | null | undefined
export type UserIdProvider = () => number | null | undefined

/**
 * BaseApi
 * - 모든 도메인 API 클래스가 상속한다.
 * - 단일 axios 인스턴스를 공유하되, 도메인별 prefix를 갖는다.
 * - 인터셉터/에러 정규화/타임아웃을 한 곳에서 관리.
 *
 * 사용:
 *   class AuthApi extends BaseApi { ... }
 *   const authApi = new AuthApi(apiClient, '/auth')
 */
export abstract class BaseApi {
  protected readonly client: AxiosInstance
  protected readonly prefix: string

  constructor(client: AxiosInstance, prefix = '') {
    this.client = client
    this.prefix = prefix
  }

  /**
   * 빈 path 는 "리소스 루트" (예: GET /clubs, GET /schools) 로 쓴다.
   * 종전 로직은 `''`→`'/'` 가 되어 `/schools/` 처럼 후행 슬래시만 붙는 URL 이 나와
   * Spring Security `requestMatchers` 와 불일치(403)할 수 있다.
   */
  protected url(path: string): string {
    if (path === '') {
      if (!this.prefix) return '/'
      return this.prefix.startsWith('/') ? this.prefix : `/${this.prefix}`
    }
    if (!path.startsWith('/')) path = '/' + path
    return `${this.prefix}${path}`
  }

  protected async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.unwrap(this.client.get<T>(this.url(path), config))
  }
  protected async post<T, B = unknown>(path: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    return this.unwrap(this.client.post<T>(this.url(path), body, config))
  }
  protected async patch<T, B = unknown>(path: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    return this.unwrap(this.client.patch<T>(this.url(path), body, config))
  }
  protected async put<T, B = unknown>(path: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    return this.unwrap(this.client.put<T>(this.url(path), body, config))
  }
  protected async delete<T = void>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.unwrap(this.client.delete<T>(this.url(path), config))
  }

  private async unwrap<T>(p: Promise<AxiosResponse<T>>): Promise<T> {
    try {
      const res = await p
      return res.data
    } catch (e) {
      throw toApiError(e)
    }
  }
}

export interface CreateApiClientOptions {
  baseURL: string
  getToken?: TokenProvider
  /** Spring CUU 백엔드: Jwt 대신 X-User-Id 헤더로 유저 구분(AuthController 등). */
  getUserId?: UserIdProvider
  onUnauthorized?: () => void
  timeoutMs?: number
}

/** POST /auth/signup 시에는 자체 accessToken 대신 Firebase ID 토큰만 Authorization 에 실음. */
export const SKIP_JWT_AUTH_HEADER = 'X-Skip-Jwt-Auth' as const

/**
 * 모든 도메인 API가 공유할 axios 인스턴스 팩토리.
 * - Authorization: Bearer accessToken 자동 주입 (signup 등은 SKIP_JWT_AUTH_HEADER 로 생략)
 * - X-User-Id: 로그인 유저 id
 * - 401 일괄 핸들링 훅(onUnauthorized) — 라우터 redirect 등에 사용
 */
export function createApiClient(opts: CreateApiClientOptions): AxiosInstance {
  const instance = axios.create({
    baseURL: opts.baseURL,
    timeout: opts.timeoutMs ?? 15_000,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const skipJwt = config.headers.get(SKIP_JWT_AUTH_HEADER) === 'true'
    if (!skipJwt) {
      const token = opts.getToken?.()
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`)
      }
    }
    const uid = opts.getUserId?.()
    if (uid != null && !Number.isNaN(Number(uid))) {
      config.headers.set('X-User-Id', String(uid))
    }
    return config
  })

  instance.interceptors.response.use(
    (r) => r,
    (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        opts.onUnauthorized?.()
      }
      return Promise.reject(err)
    },
  )

  return instance
}
