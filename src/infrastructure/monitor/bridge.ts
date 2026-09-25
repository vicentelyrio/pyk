import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { emptyState, Monitor, type MonitorState } from './store'

export const monitorState: Accessor<MonitorState> = createServiceAccessor(
  emptyState,
  Monitor,
  (monitor) => monitor.changes,
)
