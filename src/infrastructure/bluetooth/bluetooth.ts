import { pair, remove, toggleDevice, togglePower, toggleScan } from './actions'
import { bluetoothState } from './bridge'
import { adapter } from './derived'

export const bluetooth = {
  ...adapter(bluetoothState),
  togglePower,
  toggleScan,
  toggleDevice,
  pair,
  remove,
} as const
