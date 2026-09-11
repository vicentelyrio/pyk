import { Effect, Stream, SubscriptionRef } from 'effect'

import type { Domain, PykError } from './errors'
import { report } from './report'

export function makeStore<S, R>(
  domain: Domain,
  initial: S,
  source: Stream.Stream<S, PykError, R>,
) {
  return Effect.gen(function* () {
    const ref = yield* SubscriptionRef.make(initial)

    yield* source.pipe(
      Stream.changes,
      Stream.runForEach((next) => SubscriptionRef.set(ref, next)),
      Effect.catchCause(report),
      Effect.forkScoped,
    )

    yield* Effect.logInfo('started')
    yield* Effect.addFinalizer(() => Effect.logInfo('stopped'))

    return {
      changes: SubscriptionRef.changes(ref),
      snapshot: SubscriptionRef.get(ref),
    } as const
  }).pipe(Effect.annotateLogs({ domain }))
}
