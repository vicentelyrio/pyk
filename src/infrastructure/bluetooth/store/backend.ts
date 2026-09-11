import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { BluetoothState } from './state'

export class BluetoothBackend extends Context.Service<BluetoothBackend, {
  readonly changes: Stream.Stream<BluetoothState, SourceError>
  readonly togglePower: Effect.Effect<void, ActionError>
  readonly toggleDevice: (address: string) => Effect.Effect<void, ActionError>
}>()('pyk/BluetoothBackend') {}
