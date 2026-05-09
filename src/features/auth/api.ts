import { BaseApi, apiClient } from '@/shared/api'
import type { User, PersonalRole } from '@/shared/api/types'

export interface LoginResponse {
  accessToken: string
  isNewUser: boolean
  user: User
}

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
  login(firebaseIdToken: string) {
    return this.post<LoginResponse>('/login', { firebaseIdToken })
  }

  signup(body: SignupRequest) {
    return this.post<User>('/signup', body)
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
