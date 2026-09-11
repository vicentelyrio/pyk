import { execAsync, subprocess } from 'ags/process'
import { Cause, Effect, Layer, Queue, Stream } from 'effect'

import { attemptPromise, SourceError } from '@/infraestructure/effect'

import { NiriIpc } from '../store/ipc'

const events = Stream.callback<string, SourceError>((queue) =>
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

export const NiriIpcLive = Layer.succeed(NiriIpc, {
  events,
  send: (action, args) =>
    attemptPromise('niri', action, () => execAsync(['niri', 'msg', ...args])),
})
