import { dispatch } from '@/infrastructure/runtime'

import { Network } from './store'

export function toggleWifi(): void {
  dispatch(Network, (network) => network.toggleWifi)
}
