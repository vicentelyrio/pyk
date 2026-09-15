import { lock, powerOff, reboot, suspend } from './actions'

export const session = {
  lock,
  suspend,
  reboot,
  powerOff,
} as const
