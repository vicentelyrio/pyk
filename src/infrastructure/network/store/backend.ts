import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { NetworkState } from './state'

export class NetworkBackend extends Context.Service<NetworkBackend, {
  readonly changes: Stream.Stream<NetworkState, SourceError>
  readonly toggleWifi: Effect.Effect<void, ActionError>
  readonly scan: Effect.Effect<void, ActionError>
  readonly disconnect: Effect.Effect<void, ActionError>
  readonly connect: (bssid: string, password: string | null) => Effect.Effect<void, ActionError>
}>()('pyk/NetworkBackend') {}
