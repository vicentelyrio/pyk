import { subprocess } from 'ags/process'
import { Cause, Effect, Queue, Schedule, Stream } from 'effect'

import { logFailure, SourceError } from '@/infraestructure/effect'

import { emptyState, NiriState } from './state'
import { decodeEvent } from './protocol'
import { reduce } from './reducer'

const lines = Stream.callback<string, SourceError>((queue) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const stderr: string[] = []

      const proc = subprocess({
        cmd: ['niri', 'msg', '--json', 'event-stream'],
        out: (line) => {
          Queue.offerUnsafe(queue, line)
        },
        err: (msg) => {
          stderr.push(msg)
        },
      })

      proc.connect('exit', (_proc, code) => {
        Queue.failCauseUnsafe(
          queue,
          Cause.fail(new SourceError({
            domain: 'niri',
            reason: `event-stream exited (code ${code})`,
            cause: stderr.length > 0 ? stderr.join('\n') : undefined,
          })),
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
]).pipe(Schedule.jittered)

export const stateChanges: Stream.Stream<NiriState, SourceError> = lines.pipe(
  Stream.tapError((error) => logFailure(error)),
  Stream.retry(reconnect),
  Stream.filterMapEffect(decodeEvent),
  Stream.scan(emptyState, reduce),
)
