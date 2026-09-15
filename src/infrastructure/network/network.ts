import { connect, disconnect, scan, toggleWifi } from './actions'
import { networkState } from './bridge'
import { connection } from './derived'

export const network = {
  ...connection(networkState),
  toggleWifi,
  scan,
  disconnect,
  connect,
} as const
