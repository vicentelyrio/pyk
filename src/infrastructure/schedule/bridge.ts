import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { emptyState, Schedule, type ScheduleState } from './store'

export const scheduleState: Accessor<ScheduleState> = createServiceAccessor(
  emptyState,
  Schedule,
  (schedule) => schedule.changes,
)
