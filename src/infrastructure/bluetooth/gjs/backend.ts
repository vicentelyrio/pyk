import AstalBluetooth from 'gi://AstalBluetooth'
import { Layer } from 'effect'

import { attempt, attemptPromise } from '@/infrastructure/effect'

import { BluetoothBackend } from '../store/backend'
import { stateChanges } from './connection'

const CONNECT_TIMEOUT = '15 seconds'

export const BluetoothBackendLive = Layer.sync(BluetoothBackend, () => {
  const bluetooth = AstalBluetooth.get_default()

  const find = (address: string) =>
    bluetooth.get_devices().find((device) => device.address === address) ?? null

  return {
    changes: stateChanges(bluetooth),
    togglePower: attempt('bluetooth', 'togglePower', () => bluetooth.toggle()),
    toggleDevice: (address: string) =>
      attemptPromise(
        'bluetooth',
        'toggleDevice',
        () => {
          const device = find(address)
          if (!device) return Promise.resolve()
          return device.connected ? device.disconnect_device() : device.connect_device()
        },
        CONNECT_TIMEOUT,
      ),
  }
})
