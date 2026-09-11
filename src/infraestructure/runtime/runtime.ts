import { createExternal, type Accessor } from 'ags'
import { Effect, Fiber, Layer, ManagedRuntime, Stream } from 'effect'

import { Niri } from '@/infraestructure/niri/store/controller'
import { Mpris } from '@/infraestructure/mpris/store/controller'

export type Services = Niri | Mpris

export const runtime = ManagedRuntime.make(Layer.mergeAll(Niri.Default, Mpris.Default))

export function createServiceAccessor<Svc extends Services, T>(
  init: T,
  service: Effect.Effect<Svc, never, Svc>,
  changes: (svc: Svc) => Stream.Stream<T>,
): Accessor<T> {
  return createExternal(init, (set) => {
    const fiber = runtime.runFork(
      Effect.flatMap(service, (svc) =>
        Stream.runForEach(changes(svc), (next) => Effect.sync(() => set(next))),
      ),
    )

    return () => {
      Effect.runFork(Fiber.interrupt(fiber))
    }
  })
}

export function dispatch<Svc extends Services>(
  service: Effect.Effect<Svc, never, Svc>,
  action: (svc: Svc) => Effect.Effect<unknown, unknown>,
): void {
  runtime.runFork(
    Effect.flatMap(service, action).pipe(Effect.catchAll((error) => Effect.logError(error))),
  )
}
