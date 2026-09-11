import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infraestructure/effect'

import { MprisBackend } from './backend'
import { emptyState, type MprisState } from './state'

export class Mpris extends Context.Service<Mpris, {
  readonly changes: Stream.Stream<MprisState>
  readonly snapshot: Effect.Effect<MprisState>
  readonly playPause: Effect.Effect<void, ActionError>
  readonly next: Effect.Effect<void, ActionError>
  readonly previous: Effect.Effect<void, ActionError>
}>()('pyk/Mpris') {}

export const MprisLayer = Layer.effect(
  Mpris,
  Effect.gen(function* () {
    const backend = yield* MprisBackend
    const store = yield* makeStore('mpris', emptyState, backend.changes)

    return {
      ...store,
      playPause: backend.playPause,
      next: backend.next,
      previous: backend.previous,
    }
  }),
)
