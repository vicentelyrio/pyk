import { Duration, Effect } from 'effect'

import { StartupConfig } from '@/infrastructure/config/store/references'

import { ActionError, type Domain } from './errors'

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
  timeout?: Duration.Input,
): Effect.Effect<A, ActionError> {
  return Effect.flatMap(StartupConfig, ({ system }) =>
    Effect.tryPromise({
      try: () => run(),
      catch: (cause) => new ActionError({ domain, action, cause }),
    }).pipe(
      Effect.timeout(timeout ?? Duration.millis(system.actionTimeout)),
      Effect.catchTag('TimeoutError', () =>
        Effect.fail(new ActionError({ domain, action, cause: 'timeout' })),
      ),
    ),
  ).pipe(instrument(domain, action))
}
