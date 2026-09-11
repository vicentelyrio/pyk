import { execAsync } from 'ags/process'
import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, attemptPromise, makeStore } from '@/infraestructure/effect'

import { emptyState, type NiriState } from './state'
import { stateChanges } from './connection'

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
    const store = yield* makeStore('niri', emptyState, stateChanges)

    const send = (action: string, args: ReadonlyArray<string>) =>
      attemptPromise('niri', action, () => execAsync(['niri', 'msg', ...args]))

    return {
      ...store,
      action: (name: string, ...args: ReadonlyArray<string>) =>
        send(name, ['action', name, ...args]),
      focusWorkspace: (reference: number | string) =>
        send('focus-workspace', ['action', 'focus-workspace', String(reference)]),
    }
  }),
)
