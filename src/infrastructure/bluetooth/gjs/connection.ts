import AstalBluetooth from 'gi://AstalBluetooth'
import { Schedule, Stream } from 'effect'

import { fromSignal, logFailure, type SourceError } from '@/infrastructure/effect'

import type { BluetoothState } from '../store/state'
import { pairedDevices, snapshot } from './devices'

const reconnect = Schedule.spaced('5 seconds').pipe(Schedule.jittered)

export function stateChanges(
  bluetooth: AstalBluetooth.Bluetooth,
): Stream.Stream<BluetoothState, SourceError> {
  const snap = () => snapshot(bluetooth)

  const fromAdapter = fromSignal('bluetooth', bluetooth, 'notify', snap)

  const fromDevices = fromSignal(
    'bluetooth',
    bluetooth,
    'notify::devices',
    () => pairedDevices(bluetooth),
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

  return Stream.mergeAll([fromAdapter, fromDevices], { concurrency: 'unbounded' }).pipe(
    Stream.tapError((error) => logFailure(error)),
    Stream.retry(reconnect),
  )
}
