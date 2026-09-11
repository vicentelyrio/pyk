import { toggleWifi } from './actions'
import { networkState } from './bridge'
import { connection } from './derived'

export const network = {
  ...connection(networkState),
  toggleWifi,
} as const
