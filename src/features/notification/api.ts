import { BaseApi, apiClient } from '@/shared/api'
import type { Notification } from '@/shared/api/types'

class NotificationApi extends BaseApi {
  list(unreadOnly = false) {
    return this.get<Notification[]>('', { params: { unreadOnly } })
  }
  markRead(id: number) {
    return this.patch<void>(`/${id}/read`)
  }
  readAll() {
    return this.patch<void>('/read-all')
  }
}

export const notificationApi = new NotificationApi(apiClient, '/notifications')
