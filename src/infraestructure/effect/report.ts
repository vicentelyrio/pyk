import { Cause, Effect, Option } from 'effect'

import { annotations, type PykError } from './errors'

export function logFailure(
  error: PykError,
  cause: Cause.Cause<PykError> = Cause.fail(error),
): Effect.Effect<void> {
  return Effect.logWarning(error.message, cause).pipe(Effect.annotateLogs(annotations(error)))
}

export function report(cause: Cause.Cause<PykError>): Effect.Effect<void> {
  if (Cause.hasInterruptsOnly(cause)) return Effect.void
  if (Cause.hasDies(cause)) return Effect.logError('defect', cause)

  return Option.match(Cause.findErrorOption(cause), {
    onNone: () => Effect.logError('unknown failure', cause),
    onSome: (error) => logFailure(error, cause),
  })
}
