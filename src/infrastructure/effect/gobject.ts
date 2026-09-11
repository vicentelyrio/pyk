import { Cause, Effect, Queue, Stream } from 'effect'

import { type Domain, SourceError } from './errors'

export interface Signals {
  connect(signal: string, callback: (...args: any[]) => any): number
  disconnect(id: number): void
}

export function fromSignal<A>(
  domain: Domain,
  object: Signals,
  signal: string,
  read: () => A,
): Stream.Stream<A, SourceError> {
  return Stream.callback<A, SourceError>(
    (queue) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const push = () => {
            try {
              Queue.offerUnsafe(queue, read())
            }
            catch (cause) {
              Queue.failCauseUnsafe(
                queue,
                Cause.fail(new SourceError({ domain, reason: `reading ${signal}`, cause })),
              )
            }
          }

          push()

          return object.connect(signal, push)
        }),
        (id) => Effect.sync(() => object.disconnect(id)),
      ),
    { bufferSize: 1, strategy: 'sliding' },
  )
}
