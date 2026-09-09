import { subprocess } from 'ags/process'
import { Data, Effect, Schedule, Stream } from 'effect'

import { decodeEvent } from './protocol'
import { emptyState, NiriState, reduce } from './state'

class NiriIpcError extends Data.TaggedError('NiriIpcError')<{
  readonly reason: string
}> {}

export class NiriActionError extends Data.TaggedError('NiriActionError')<{
  readonly command: string
  readonly cause: unknown
}> {}

const lines = Stream.asyncPush<string, NiriIpcError>(
  (emit) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const proc = subprocess({
          cmd: ['niri', 'msg', '--json', 'event-stream'],
          out: (line) => emit.single(line),
          err: (msg) => console.error('niri ipc (stderr):', msg),
        })
        proc.connect('exit', (_proc, code) =>
          emit.fail(new NiriIpcError({ reason: `event-stream exited (code ${code})` })),
        )
        return proc
      }),
      (proc) => Effect.sync(() => proc.kill()),
    ),
  { bufferSize: 256 },
)

const reconnect = Schedule.exponential('500 millis', 2).pipe(
  Schedule.union(Schedule.spaced('5 seconds')),
  Schedule.jittered,
  Schedule.tapOutput(() => Effect.logWarning('niri: reconnecting to event-stream')),
)

export const stateChanges: Stream.Stream<NiriState, NiriIpcError> = lines.pipe(
  Stream.filterMap(decodeEvent),
  Stream.scan(emptyState, reduce),
  Stream.retry(reconnect),
)

