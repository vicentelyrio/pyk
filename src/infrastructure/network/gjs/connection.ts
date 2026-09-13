import AstalNetwork from 'gi://AstalNetwork'
import { Stream } from 'effect'

import { fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import type { NetworkState } from '../store/state'
import { activeDevice, snapshot } from './device'

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
    reconnecting,
  )
}
