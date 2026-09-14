import { Context, Effect, Layer, Stream } from 'effect'

import { makeStore } from '@/infrastructure/effect'

import { BatteryBackend } from './backend'
import { emptyState, type BatteryState } from './state'

export class Battery extends Context.Service<Battery, {
  readonly changes: Stream.Stream<BatteryState>
  readonly snapshot: Effect.Effect<BatteryState>
}>()('pyk/Battery') {}

export const BatteryLayer = Layer.effect(
  Battery,
  Effect.gen(function* () {
    const backend = yield* BatteryBackend
    return yield* makeStore('battery', emptyState, backend.changes)
  }),
)
