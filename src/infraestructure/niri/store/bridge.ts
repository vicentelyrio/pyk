import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infraestructure/runtime'

import { Niri } from './controller'
import { emptyState, type NiriState } from './state'

export const niriState: Accessor<NiriState> = createServiceAccessor(
  emptyState,
  Niri,
  (niri) => niri.changes,
)
