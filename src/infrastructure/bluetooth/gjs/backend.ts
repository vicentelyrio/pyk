import AstalBluetooth from 'gi://AstalBluetooth'
import { Duration, Effect, Layer } from 'effect'

import { StartupConfig } from '@/infrastructure/config/store/references'
import { attempt, attemptPromise } from '@/infrastructure/effect'

import { BluetoothBackend } from '../store/backend'
import { stateChanges } from './connection'

export const BluetoothBackendLive = Layer.effect(BluetoothBackend, Effect.gen(function* () {
  const { system } = yield* StartupConfig
  const bluetooth = AstalBluetooth.get_default()

  const find = (address: string) =>
    bluetooth.get_devices().find((device) => device.address === address) ?? null

  return {
    changes: stateChanges(bluetooth),
    togglePower: attempt('bluetooth', 'togglePower', () => bluetooth.toggle()),
    toggleScan: attempt('bluetooth', 'toggleScan', () => {
      const adapter = bluetooth.get_adapter()
      if (!adapter) return

      if (adapter.discovering) adapter.stop_discovery()
      else adapter.start_discovery()
    }),
    toggleDevice: (address: string) =>
      attemptPromise(
        'bluetooth',
        'toggleDevice',
        () => {
          const device = find(address)
          if (!device) return Promise.resolve()
          return device.connected ? device.disconnect_device() : device.connect_device()
        },
        Duration.millis(system.bluetoothConnectTimeout),
      ),
    pair: (address: string) =>
      attempt('bluetooth', 'pair', () => {
        find(address)?.pair()
      }),
    remove: (address: string) =>
      attempt('bluetooth', 'remove', () => {
        const adapter = bluetooth.get_adapter()
        const device = find(address)
        if (adapter && device) adapter.remove_device(device)
      }),
  }
}))
