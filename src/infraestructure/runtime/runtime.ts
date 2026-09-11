import { createExternal, type Accessor } from 'ags'
import { Effect, Fiber, Layer, ManagedRuntime, Stream } from 'effect'

import { NiriLayer } from '@/infraestructure/niri/store/controller'
import { MprisLayer } from '@/infraestructure/mpris/store/controller'

const MainLayer = Layer.mergeAll(NiriLayer, MprisLayer)

export type Services = Layer.Success<typeof MainLayer>

export const runtime = ManagedRuntime.make(MainLayer)

export function createServiceAccessor<Shape, T>(
  init: T,
  service: Effect.Effect<Shape, never, Services>,
  changes: (svc: Shape) => Stream.Stream<T>,
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

export function dispatch<Shape>(
  service: Effect.Effect<Shape, never, Services>,
  action: (svc: Shape) => Effect.Effect<unknown, unknown>,
): void {
  runtime.runFork(
    Effect.flatMap(service, action).pipe(
      Effect.catchCause((cause) => Effect.logError('dispatch failed', cause)),
    ),
  )
}
