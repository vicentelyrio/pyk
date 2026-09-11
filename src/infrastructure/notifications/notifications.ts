import { dismiss, dismissAll, invoke, toggleDontDisturb } from './actions'
import { notificationsState } from './bridge'
import { inbox } from './derived'

export const notifications = {
  ...inbox(notificationsState),
  dismiss,
  dismissAll,
  invoke,
  toggleDontDisturb,
} as const
