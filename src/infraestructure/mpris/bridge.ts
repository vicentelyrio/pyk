import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infraestructure/runtime'

import { Mpris } from './store'
import { emptyState, type MprisState } from './store'

export const mprisState: Accessor<MprisState> = createServiceAccessor(
  emptyState,
  Mpris,
  (mpris) => mpris.changes,
)
