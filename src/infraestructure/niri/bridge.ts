import { createExternal, type Accessor } from 'ags'
import { Effect, Fiber, ManagedRuntime, Stream } from 'effect'

import { Niri } from './controller'
import { emptyState, NiriState } from './state'
import { Workspace } from './protocol'

export const runtime = ManagedRuntime.make(Niri.Default)

export const niriState: Accessor<NiriState> = createExternal(emptyState, (set) => {
  const fiber = runtime.runFork(
    Effect.flatMap(Niri, (niri) =>
      Stream.runForEach(niri.changes, (next) => Effect.sync(() => set(next))),
    ),
  )
  return () => {
    Effect.runFork(Fiber.interrupt(fiber))
  }
})

export function sameShape(a: readonly Workspace[], b: readonly Workspace[]) {
  return (
    a.length === b.length &&
    a.every((w, i) => {
      const n = b[i]
      return w.id === n.id && w.idx === n.idx && w.name === n.name && w.output === n.output
    })
  )
}

export function sameIds(a: ReadonlySet<number>, b: ReadonlySet<number>) {
  return a.size === b.size && [...a].every((id) => b.has(id))
}
