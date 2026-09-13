import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { Clock, type ClockState } from './store'

export const clockState: Accessor<ClockState> = createServiceAccessor(
  { now: Date.now() },
  Clock,
  (clock) => clock.changes,
)
