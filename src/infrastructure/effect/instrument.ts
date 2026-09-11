import { Duration, Effect } from 'effect'

import { ActionError, type Domain } from './errors'

const DEFAULT_TIMEOUT: Duration.Input = '3 seconds'

function instrument(domain: Domain, action: string) {
  const name = `${domain}.${action}`

  return <A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    self.pipe(
      Effect.withLogSpan(name),
      Effect.annotateLogs({ domain, action }),
      Effect.withSpan(name, { attributes: { domain, action } }),
    )
}

export function attempt<A>(
  domain: Domain,
  action: string,
  run: () => A,
): Effect.Effect<A, ActionError> {
  return Effect.suspend(() => {
    try {
      return Effect.succeed(run())
    }
    catch (cause) {
      return Effect.fail(new ActionError({ domain, action, cause }))
    }
  }).pipe(instrument(domain, action))
}

export function attemptPromise<A>(
  domain: Domain,
  action: string,
  run: () => PromiseLike<A>,
  timeout: Duration.Input = DEFAULT_TIMEOUT,
): Effect.Effect<A, ActionError> {
  return Effect.tryPromise({
    try: () => run(),
    catch: (cause) => new ActionError({ domain, action, cause }),
  }).pipe(
    Effect.timeout(timeout),
    Effect.catchTag('TimeoutError', () =>
      Effect.fail(new ActionError({ domain, action, cause: 'timeout' })),
    ),
    instrument(domain, action),
  )
}
