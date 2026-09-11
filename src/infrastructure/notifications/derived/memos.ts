import { Accessor, createMemo } from 'ags'
import { Equal } from 'effect'

import type { NotificationsState } from '../store/state'

export function inbox(state: Accessor<NotificationsState>) {
  return {
    notifications: createMemo(() => state().notifications, { equals: Equal.equals }),
    count: createMemo(() => state().notifications.length),
    hasNotifications: createMemo(() => state().notifications.length > 0),
    dontDisturb: createMemo(() => state().dontDisturb),
  }
}
