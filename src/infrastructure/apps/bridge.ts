import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { Apps, emptyState, type AppsState } from './store'

export const appsState: Accessor<AppsState> = createServiceAccessor(
  emptyState,
  Apps,
  (apps) => apps.changes,
)
