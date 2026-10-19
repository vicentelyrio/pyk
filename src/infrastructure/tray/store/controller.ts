import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import { TrayBackend } from './backend'
import { emptyState, type TrayState } from './state'

export class Tray extends Context.Service<Tray, {
  readonly changes: Stream.Stream<TrayState>
  readonly snapshot: Effect.Effect<TrayState>
  readonly activate: (id: string, x: number, y: number) => Effect.Effect<void, ActionError>
  readonly secondaryActivate: (id: string, x: number, y: number) => Effect.Effect<void, ActionError>
  readonly aboutToShow: (id: string) => Effect.Effect<void, ActionError>
}>()('pyk/Tray') {}

export const TrayLayer = Layer.effect(
  Tray,
  Effect.gen(function* () {
    const backend = yield* TrayBackend
    const store = yield* makeStore('tray', emptyState, backend.changes)

    return {
      ...store,
      activate: backend.activate,
      secondaryActivate: backend.secondaryActivate,
      aboutToShow: backend.aboutToShow,
    }
  }),
)
