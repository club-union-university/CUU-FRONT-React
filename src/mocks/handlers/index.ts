import { authHandlers } from './auth'
import { schoolHandlers } from './school'
import { clubHandlers } from './club'
import { eventHandlers } from './event'
import { participantHandlers } from './participant'
import { postHandlers } from './post'
import { commentHandlers } from './comment'
import { chatHandlers } from './chat'
import { notificationHandlers } from './notification'

export const handlers = [
  ...authHandlers,
  ...schoolHandlers,
  ...clubHandlers,
  ...eventHandlers,
  ...participantHandlers,
  ...postHandlers,
  ...commentHandlers,
  ...chatHandlers,
  ...notificationHandlers,
]
