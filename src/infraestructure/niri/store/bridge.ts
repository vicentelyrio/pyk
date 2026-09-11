import { createExternal, type Accessor } from 'ags'
import { Effect, Fiber, ManagedRuntime, Stream } from 'effect'

import { Niri } from './controller'
import { emptyState, NiriState } from './state'

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
