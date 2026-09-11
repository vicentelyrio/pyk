import { createExternal, type Accessor } from 'ags'
import { timeout } from 'ags/time'
import { Effect, Fiber, Layer, LogLevel, ManagedRuntime, Option, Stream } from 'effect'

import { Niri } from '@/infraestructure/niri/store/controller'
import { Mpris } from '@/infraestructure/mpris/store/controller'

export type Services = Niri | Mpris

const DISPOSE_TIMEOUT = 2000

const Platform = Layer.setUnhandledErrorLogLevel(Option.some(LogLevel.Error))

const MainLayer = Layer.mergeAll(Niri.Default, Mpris.Default).pipe(Layer.provideMerge(Platform))

export const runtime = ManagedRuntime.make(MainLayer)

export function shutdown(quit: () => void): void {
  const deadline = new Promise<void>((resolve) => {
    timeout(DISPOSE_TIMEOUT, resolve)
  })

  Promise.race([runtime.dispose(), deadline]).then(quit, quit)
}

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
    Effect.flatMap(service, action).pipe(
      Effect.catchAllCause((cause) => Effect.logError('dispatch failed', cause)),
    ),
  )
}
