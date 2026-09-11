import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { emptyState, Notifications, type NotificationsState } from './store'

export const notificationsState: Accessor<NotificationsState> = createServiceAccessor(
  emptyState,
  Notifications,
  (notifications) => notifications.changes,
)
