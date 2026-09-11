import { createExternal, type Accessor } from 'ags'
import { Effect, Fiber, Layer, ManagedRuntime, Stream } from 'effect'

import { type PykError, report } from '@/infraestructure/effect'
import { Platform } from '@/infraestructure/effect/logger'
import { NiriIpcLive } from '@/infraestructure/niri/gjs/ipc'
import { NiriLayer } from '@/infraestructure/niri/store/controller'
import { MprisBackendLive } from '@/infraestructure/mpris/gjs/backend'
import { MprisLayer } from '@/infraestructure/mpris/store/controller'

const MainLayer = Layer.mergeAll(
  NiriLayer.pipe(Layer.provide([NiriIpcLive])),
  MprisLayer.pipe(Layer.provide([MprisBackendLive])),
).pipe(Layer.provideMerge([Platform]))

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

export function dispatch<Shape, E extends PykError>(
  service: Effect.Effect<Shape, never, Services>,
  action: (svc: Shape) => Effect.Effect<unknown, E>,
): void {
  runtime.runFork(Effect.flatMap(service, action).pipe(Effect.catchCause(report)))
}
