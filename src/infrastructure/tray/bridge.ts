import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { Tray, emptyState, type TrayState } from './store'

export const trayState: Accessor<TrayState> = createServiceAccessor(
  emptyState,
  Tray,
  (tray) => tray.changes,
)
