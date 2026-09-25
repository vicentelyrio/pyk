import { Context, Effect, Layer, Stream } from 'effect'

import { makeStore } from '@/infrastructure/effect'

import { MonitorBackend } from './backend'
import { emptyState, type MonitorState } from './state'

export class Monitor extends Context.Service<Monitor, {
  readonly changes: Stream.Stream<MonitorState>
  readonly snapshot: Effect.Effect<MonitorState>
}>()('pyk/Monitor') {}

export const MonitorLayer = Layer.effect(
  Monitor,
  Effect.gen(function* () {
    const backend = yield* MonitorBackend
    return yield* makeStore('monitor', emptyState, backend.changes)
  }),
)
