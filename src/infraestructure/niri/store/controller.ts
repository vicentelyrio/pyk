import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infraestructure/effect'

import { stateChanges } from './events'
import { NiriIpc } from './ipc'
import { emptyState, type NiriState } from './state'

export class Niri extends Context.Service<Niri, {
  readonly changes: Stream.Stream<NiriState>
  readonly snapshot: Effect.Effect<NiriState>
  readonly action: (
    name: string,
    ...args: ReadonlyArray<string>
  ) => Effect.Effect<unknown, ActionError>
  readonly focusWorkspace: (
    reference: number | string,
  ) => Effect.Effect<unknown, ActionError>
}>()('pyk/Niri') {}

export const NiriLayer = Layer.effect(
  Niri,
  Effect.gen(function* () {
    const ipc = yield* NiriIpc
    const store = yield* makeStore('niri', emptyState, stateChanges)

    return {
      ...store,
      action: (name: string, ...args: ReadonlyArray<string>) =>
        ipc.send(name, ['action', name, ...args]),
      focusWorkspace: (reference: number | string) =>
        ipc.send('focus-workspace', ['action', 'focus-workspace', String(reference)]),
    }
  }),
)
