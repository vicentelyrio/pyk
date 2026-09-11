import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import { BluetoothBackend } from './backend'
import { emptyState, type BluetoothState } from './state'

export class Bluetooth extends Context.Service<Bluetooth, {
  readonly changes: Stream.Stream<BluetoothState>
  readonly snapshot: Effect.Effect<BluetoothState>
  readonly togglePower: Effect.Effect<void, ActionError>
  readonly toggleDevice: (address: string) => Effect.Effect<void, ActionError>
}>()('pyk/Bluetooth') {}

export const BluetoothLayer = Layer.effect(
  Bluetooth,
  Effect.gen(function* () {
    const backend = yield* BluetoothBackend
    const store = yield* makeStore('bluetooth', emptyState, backend.changes)

    return {
      ...store,
      togglePower: backend.togglePower,
      toggleDevice: backend.toggleDevice,
    }
  }),
)
