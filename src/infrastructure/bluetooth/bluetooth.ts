import { toggleDevice, togglePower } from './actions'
import { bluetoothState } from './bridge'
import { adapter } from './derived'

export const bluetooth = {
  ...adapter(bluetoothState),
  togglePower,
  toggleDevice,
} as const
