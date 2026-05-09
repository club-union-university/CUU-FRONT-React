import { BaseApi, apiClient } from '@/shared/api'
import { SKIP_JWT_AUTH_HEADER } from '@/shared/api/base'
import { useAuthStore } from './store'
import type { User, PersonalRole } from '@/shared/api/types'

export interface LoginResponse {
  accessToken: string
  isNewUser: boolean
  user: User
}

/** Spring 로그인 바디: 종종 `newUser` 로 옴 (OpenAPI/프론트는 `isNewUser`). */
export interface LoginResponseRaw {
  accessToken: string
  isNewUser?: boolean
  newUser?: boolean
  user: User
}

export function normalizeLoginResponse(raw: LoginResponseRaw): LoginResponse {
  return {
    accessToken: raw.accessToken,
    isNewUser: Boolean(raw.isNewUser ?? raw.newUser),
    user: raw.user,
  }
}

/** 폼 입력용. 실제 전송은 Spring SignupRequest(nickname, schoolId, bio)만 보냄. */
export interface SignupRequest {
  nickname: string
  schoolId: number
  personalRole?: PersonalRole
  bio?: string
}

export interface UpdateProfileRequest {
  nickname?: string
  profileImage?: string
  personalRole?: PersonalRole
  bio?: string
}

class AuthApi extends BaseApi {
  async login(firebaseIdToken: string): Promise<LoginResponse> {
    const raw = await this.post<LoginResponseRaw>('/login', { firebaseIdToken })
    return normalizeLoginResponse(raw)
  }

  /**
   * Spring AuthService.signup: Authorization 전체 문자열을 Firebase verify 에 넘기는 패턴 대비.
   * Bearer 접두어 없이 순수 Firebase ID JWT만 보냄(FirebaseAuth.verifyIdToken 입력과 동일).
   */
  signup(body: SignupRequest) {
    const firebaseIdToken = useAuthStore.getState().pendingFirebaseIdToken
    if (!firebaseIdToken) {
      return Promise.reject(new Error('회원가입에 필요한 로그인 세션이 없습니다. 다시 로그인해 주세요.'))
    }
    const nickname = body.nickname.trim()
    const schoolId = Number(body.schoolId)
    const payload: { nickname: string; schoolId: number; bio?: string } = { nickname, schoolId }
    const bioTrim = body.bio?.trim()
    if (bioTrim) payload.bio = bioTrim

    return this.post<User>('/signup', payload, {
      headers: {
        [SKIP_JWT_AUTH_HEADER]: 'true',
        Authorization: firebaseIdToken,
      },
    })
  }

  me() {
    return this.get<User>('/me')
  }
}

class UserApi extends BaseApi {
  getById(id: number) {
    return this.get<User>(`/${id}`)
  }

  updateMe(body: UpdateProfileRequest) {
    return this.patch<User>('/me', body)
  }
}

export const authApi = new AuthApi(apiClient, '/auth')
export const userApi = new UserApi(apiClient, '/users')
