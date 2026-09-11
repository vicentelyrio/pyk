import { execAsync } from 'ags/process'
import { Context, Effect, Layer, Stream, SubscriptionRef } from 'effect'

import { emptyState, type NiriState } from './state'
import { NiriActionError, stateChanges } from './connection'

export class Niri extends Context.Service<Niri, {
  readonly changes: Stream.Stream<NiriState>
  readonly snapshot: Effect.Effect<NiriState>
  readonly action: (
    name: string,
    ...args: ReadonlyArray<string>
  ) => Effect.Effect<unknown, NiriActionError>
  readonly focusWorkspace: (
    reference: number | string,
  ) => Effect.Effect<unknown, NiriActionError>
}>()('pyk/Niri') {}

export const NiriLayer = Layer.effect(
  Niri,
  Effect.gen(function* () {
    const state = yield* SubscriptionRef.make(emptyState)

    yield* Stream.runForEach(stateChanges, (next) => SubscriptionRef.set(state, next)).pipe(
      Effect.tapCause((cause) => Effect.logError('niri: event stream stopped', cause)),
      Effect.forkScoped,
    )

    const send = (args: ReadonlyArray<string>) =>
      Effect.tryPromise({
        try: () => execAsync(['niri', 'msg', ...args]),
        catch: (cause) => new NiriActionError({
          command: `niri msg ${args.join(' ')}`,
          cause
        }),
      })

    return {
      changes: SubscriptionRef.changes(state),
      snapshot: SubscriptionRef.get(state),
      action: (name: string, ...args: ReadonlyArray<string>) => send(['action', name, ...args]),
      focusWorkspace: (reference: number | string) => send(['action', 'focus-workspace', String(reference)]),
    }
  }),
)
