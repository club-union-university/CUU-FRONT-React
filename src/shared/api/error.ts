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

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorPayload | undefined
    return new ApiError(data?.message ?? err.message, {
      status: err.response?.status ?? 0,
      code: data?.code,
      fieldErrors: data?.fieldErrors,
      cause: err,
    })
  }
  if (err instanceof Error) {
    return new ApiError(err.message, { status: 0, cause: err })
  }
  return new ApiError('Unknown error', { status: 0, cause: err })
}
