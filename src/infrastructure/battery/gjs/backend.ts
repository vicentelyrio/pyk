import AstalBattery from 'gi://AstalBattery'
import { Layer, Stream } from 'effect'

import { fromSignal, reconnecting } from '@/infrastructure/effect'

import { BatteryBackend } from '../store/backend'
import { emptyState, type BatteryState } from '../store/state'

function snapshot(device: AstalBattery.Device): BatteryState {
  if (!device.isPresent) return emptyState

  return {
    isPresent: true,
    percentage: device.percentage,
    isCharging: device.charging,
    secondsLeft: device.charging ? device.timeToFull : device.timeToEmpty,
    icon: device.iconName,
  }
}

export const BatteryBackendLive = Layer.sync(BatteryBackend, () => {
  const device = AstalBattery.get_default()

  return {
    changes: fromSignal('battery', device, 'notify', () => snapshot(device)).pipe(reconnecting),
  }
})
