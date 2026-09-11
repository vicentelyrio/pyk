import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { emptyState, Niri, type NiriState } from './store'

export const niriState: Accessor<NiriState> = createServiceAccessor(
  emptyState,
  Niri,
  (niri) => niri.changes,
)
