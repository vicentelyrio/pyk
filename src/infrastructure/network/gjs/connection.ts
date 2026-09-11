import AstalNetwork from 'gi://AstalNetwork'
import { Schedule, Stream } from 'effect'

import { fromSignal, logFailure, type SourceError } from '@/infrastructure/effect'

import type { NetworkState } from '../store/state'
import { activeDevice, snapshot } from './device'

const reconnect = Schedule.spaced('5 seconds').pipe(Schedule.jittered)

export function stateChanges(
  network: AstalNetwork.Network,
): Stream.Stream<NetworkState, SourceError> {
  const snap = () => snapshot(network)

  const fromNetwork = fromSignal('network', network, 'notify', snap)

  const fromDevice = fromSignal('network', network, 'notify', () => activeDevice(network)).pipe(
    Stream.changesWith((a, b) => a === b),
    Stream.switchMap((device) =>
      device ? fromSignal('network', device, 'notify', snap) : Stream.empty,
    ),
  )

  return Stream.mergeAll([fromNetwork, fromDevice], { concurrency: 'unbounded' }).pipe(
    Stream.tapError((error) => logFailure(error)),
    Stream.retry(reconnect),
  )
}
