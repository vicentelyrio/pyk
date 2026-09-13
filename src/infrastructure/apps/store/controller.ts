import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import { AppsBackend } from './backend'
import { emptyState, type AppsState } from './state'

export class Apps extends Context.Service<Apps, {
  readonly changes: Stream.Stream<AppsState>
  readonly snapshot: Effect.Effect<AppsState>
  readonly launch: (id: string) => Effect.Effect<void, ActionError>
  readonly reload: Effect.Effect<void, ActionError>
}>()('pyk/Apps') {}

export const AppsLayer = Layer.effect(
  Apps,
  Effect.gen(function* () {
    const backend = yield* AppsBackend
    const store = yield* makeStore('apps', emptyState, backend.changes)

    return {
      ...store,
      launch: backend.launch,
      reload: backend.reload,
    }
  }),
)
