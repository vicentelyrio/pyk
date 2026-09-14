import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { Battery, emptyState, type BatteryState } from './store'

export const batteryState: Accessor<BatteryState> = createServiceAccessor(
  emptyState,
  Battery,
  (battery) => battery.changes,
)
