import { subprocess } from 'ags/process'
import { Cause, Data, Effect, Queue, Schedule, Stream } from 'effect'

import { emptyState, NiriState } from './state'
import { decodeEvent } from './protocol'
import { reduce } from './reducer'

class NiriIpcError extends Data.TaggedError('NiriIpcError')<{
  readonly reason: string
}> {}

export class NiriActionError extends Data.TaggedError('NiriActionError')<{
  readonly command: string
  readonly cause: unknown
}> {}

const lines = Stream.callback<string, NiriIpcError>((queue) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const proc = subprocess({
        cmd: ['niri', 'msg', '--json', 'event-stream'],
        out: (line) => {
          Queue.offerUnsafe(queue, line)
        },
        err: (msg) => console.error('niri ipc (stderr):', msg),
      })
      proc.connect('exit', (_proc, code) => {
        Queue.failCauseUnsafe(
          queue,
          Cause.fail(new NiriIpcError({ reason: `event-stream exited (code ${code})` })),
        )
      })
      return proc
    }),
    (proc) => Effect.sync(() => proc.kill()),
  ),
)

const reconnect = Schedule.min([
  Schedule.exponential('500 millis', 2),
  Schedule.spaced('5 seconds'),
]).pipe(
  Schedule.jittered,
  Schedule.tap(() => Effect.logWarning('niri: reconnecting to event-stream')),
)

export const stateChanges: Stream.Stream<NiriState, NiriIpcError> = lines.pipe(
  Stream.retry(reconnect),
  Stream.filterMap(decodeEvent),
  Stream.scan(emptyState, reduce),
  Stream.changes,
)
