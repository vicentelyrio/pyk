import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infraestructure/runtime'

import { Mpris } from './controller'
import { emptyState, type MprisState } from './state'

export const mprisState: Accessor<MprisState> = createServiceAccessor(
  emptyState,
  Mpris,
  (mpris) => mpris.changes,
)
