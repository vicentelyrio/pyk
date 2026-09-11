import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { NetworkState } from './state'

export class NetworkBackend extends Context.Service<NetworkBackend, {
  readonly changes: Stream.Stream<NetworkState, SourceError>
  readonly toggleWifi: Effect.Effect<void, ActionError>
}>()('pyk/NetworkBackend') {}
