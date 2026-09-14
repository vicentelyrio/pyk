import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import { BrightnessBackend } from './backend'
import { emptyState, type BrightnessState } from './state'

export class Brightness extends Context.Service<Brightness, {
  readonly changes: Stream.Stream<BrightnessState>
  readonly snapshot: Effect.Effect<BrightnessState>
  readonly setLevel: (level: number) => Effect.Effect<void, ActionError>
  readonly refresh: Effect.Effect<void, ActionError>
}>()('pyk/Brightness') {}

export const BrightnessLayer = Layer.effect(
  Brightness,
  Effect.gen(function* () {
    const backend = yield* BrightnessBackend
    const store = yield* makeStore('brightness', emptyState, backend.changes)

    return {
      ...store,
      setLevel: backend.setLevel,
      refresh: backend.refresh,
    }
  }),
)
