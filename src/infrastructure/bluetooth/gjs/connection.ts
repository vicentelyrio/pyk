import AstalBluetooth from 'gi://AstalBluetooth'
import { Stream } from 'effect'

import { fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import type { BluetoothState } from '../store/state'
import { snapshot } from './devices'

export function stateChanges(
  bluetooth: AstalBluetooth.Bluetooth,
): Stream.Stream<BluetoothState, SourceError> {
  const snap = () => snapshot(bluetooth)

  const fromAdapter = fromSignal('bluetooth', bluetooth, 'notify', snap)

  const fromDiscovery = fromSignal(
    'bluetooth',
    bluetooth,
    'notify',
    () => bluetooth.get_adapter(),
  ).pipe(
    Stream.changesWith((a, b) => a === b),
    Stream.switchMap((adapter) =>
      adapter ? fromSignal('bluetooth', adapter, 'notify::discovering', snap) : Stream.empty,
    ),
  )

  const fromDevices = fromSignal(
    'bluetooth',
    bluetooth,
    'notify::devices',
    () => bluetooth.get_devices(),
  ).pipe(
    Stream.switchMap((devices) =>
      Stream.mergeAll(
        [
          Stream.sync(snap),
          ...devices.map((device) => fromSignal('bluetooth', device, 'notify', snap)),
        ],
        { concurrency: 'unbounded' },
      ),
    ),
  )

  return Stream.mergeAll([fromAdapter, fromDiscovery, fromDevices], {
    concurrency: 'unbounded',
  }).pipe(reconnecting)
}
