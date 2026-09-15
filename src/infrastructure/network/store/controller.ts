import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import { NetworkBackend } from './backend'
import { emptyState, type NetworkState } from './state'

export class Network extends Context.Service<Network, {
  readonly changes: Stream.Stream<NetworkState>
  readonly snapshot: Effect.Effect<NetworkState>
  readonly toggleWifi: Effect.Effect<void, ActionError>
  readonly scan: Effect.Effect<void, ActionError>
  readonly disconnect: Effect.Effect<void, ActionError>
  readonly connect: (bssid: string, password: string | null) => Effect.Effect<void, ActionError>
}>()('pyk/Network') {}

export const NetworkLayer = Layer.effect(
  Network,
  Effect.gen(function* () {
    const backend = yield* NetworkBackend
    const store = yield* makeStore('network', emptyState, backend.changes)

    return {
      ...store,
      toggleWifi: backend.toggleWifi,
      scan: backend.scan,
      disconnect: backend.disconnect,
      connect: backend.connect,
    }
  }),
)
