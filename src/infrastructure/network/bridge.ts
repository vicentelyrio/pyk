import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { emptyState, Network, type NetworkState } from './store'

export const networkState: Accessor<NetworkState> = createServiceAccessor(
  emptyState,
  Network,
  (network) => network.changes,
)
