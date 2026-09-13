import { Duration, Effect, Schedule, Stream } from 'effect'

import { StartupConfig } from '@/infrastructure/config/store/references'

import type { PykError } from './errors'
import { logFailure } from './report'

export function reconnecting<A, E extends PykError, R>(
  self: Stream.Stream<A, E, R>,
): Stream.Stream<A, E, R> {
  return Stream.unwrap(
    Effect.map(StartupConfig, ({ system }) =>
      self.pipe(
        Stream.tapError((error) => logFailure(error)),
        Stream.retry(
          Schedule.min([
            Schedule.exponential(Duration.millis(system.reconnectDelay), 2),
            Schedule.spaced(Duration.millis(system.reconnectMaxDelay)),
          ]).pipe(Schedule.jittered),
        ),
      ),
    ),
  )
}
