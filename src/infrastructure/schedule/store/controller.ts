import { Context, Effect, Layer, Stream } from 'effect'

import { makeStore } from '@/infrastructure/effect'

import { ScheduleBackend } from './backend'
import { emptyState, type ScheduleState } from './state'

export class Schedule extends Context.Service<Schedule, {
  readonly changes: Stream.Stream<ScheduleState>
  readonly snapshot: Effect.Effect<ScheduleState>
}>()('pyk/Schedule') {}

export const ScheduleLayer = Layer.effect(
  Schedule,
  Effect.gen(function* () {
    const backend = yield* ScheduleBackend
    return yield* makeStore('schedule', emptyState, backend.changes)
  }),
)
