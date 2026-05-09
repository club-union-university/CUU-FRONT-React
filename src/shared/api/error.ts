import { AxiosError } from 'axios'

/**
 * 백엔드(Spring) 에러 페이로드 추정 형태.
 * 실제 명세 합의되면 좁혀라.
 */
export interface ApiErrorPayload {
  status?: number
  code?: string
  message?: string
  fieldErrors?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  code?: string
  fieldErrors?: Record<string, string>
  cause?: unknown

  constructor(message: string, opts: { status: number; code?: string; fieldErrors?: Record<string, string>; cause?: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.status = opts.status
    this.code = opts.code
    this.fieldErrors = opts.fieldErrors
    this.cause = opts.cause
  }

  isUnauthorized() {
    return this.status === 401
  }
  isForbidden() {
    return this.status === 403
  }
  isNotFound() {
    return this.status === 404
  }
  isServerError() {
    return this.status >= 500
  }
}

function messageFromSpringBody(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const r = data as Record<string, unknown>
  if (typeof r.message === 'string' && r.message.trim()) return r.message.trim()
  // Spring Boot 기본 에러 JSON: { status, error: "Forbidden", path }
  if (typeof r.error === 'string' && r.error.trim()) return r.error.trim()
  return undefined
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (err instanceof AxiosError) {
    const data = err.response?.data
    const payload = data as ApiErrorPayload | undefined
    const msg = messageFromSpringBody(data) ?? payload?.message ?? err.message
    return new ApiError(msg, {
      status: err.response?.status ?? 0,
      code: payload?.code,
      fieldErrors: payload?.fieldErrors,
      cause: err,
    })
  }
  if (err instanceof Error) {
    return new ApiError(err.message, { status: 0, cause: err })
  }
  return new ApiError('Unknown error', { status: 0, cause: err })
}
