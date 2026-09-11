import { execAsync } from 'ags/process'
import { Effect, Stream, SubscriptionRef } from 'effect'

import { emptyState } from './state'
import { NiriActionError, stateChanges } from './connection'

export class Niri extends Effect.Service<Niri>()('pyk/Niri', {
  scoped: Effect.gen(function* () {
    const state = yield* SubscriptionRef.make(emptyState)

    yield* Stream.runForEach(stateChanges, (next) => SubscriptionRef.set(state, next)).pipe(
      Effect.tapErrorCause((cause) => Effect.logError('niri: event stream stopped', cause)),
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
      changes: state.changes,
      snapshot: SubscriptionRef.get(state),
      action: (name: string, ...args: ReadonlyArray<string>) => send(['action', name, ...args]),
      focusWorkspace: (reference: number | string) => send(['action', 'focus-workspace', String(reference)]),
    } as const
  }),
}) {}
