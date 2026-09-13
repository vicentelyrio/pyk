import { Context, Effect, Layer, Stream } from 'effect'

import { makeStore } from '@/infrastructure/effect'

import { ClockBackend } from './backend'
import { emptyState, type ClockState } from './state'

export class Clock extends Context.Service<Clock, {
  readonly changes: Stream.Stream<ClockState>
  readonly snapshot: Effect.Effect<ClockState>
}>()('pyk/Clock') {}

export const ClockLayer = Layer.effect(
  Clock,
  Effect.gen(function* () {
    const backend = yield* ClockBackend
    return yield* makeStore('clock', emptyState, backend.changes)
  }),
)
