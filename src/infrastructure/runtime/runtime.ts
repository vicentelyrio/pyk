import { createExternal, type Accessor } from 'ags'
import { Effect, Fiber, Layer, ManagedRuntime, Stream } from 'effect'

import { type PykError, report } from '@/infrastructure/effect'
import { Platform } from '@/infrastructure/effect/logger'
import { AudioBackendLive } from '@/infrastructure/audio/gjs/backend'
import { AudioLayer } from '@/infrastructure/audio/store/controller'
import { BluetoothBackendLive } from '@/infrastructure/bluetooth/gjs/backend'
import { BluetoothLayer } from '@/infrastructure/bluetooth/store/controller'
import { NetworkBackendLive } from '@/infrastructure/network/gjs/backend'
import { NetworkLayer } from '@/infrastructure/network/store/controller'
import { NiriIpcLive } from '@/infrastructure/niri/gjs/ipc'
import { NiriLayer } from '@/infrastructure/niri/store/controller'
import { MprisBackendLive } from '@/infrastructure/mpris/gjs/backend'
import { MprisLayer } from '@/infrastructure/mpris/store/controller'

const MainLayer = Layer.mergeAll(
  AudioLayer.pipe(Layer.provide([AudioBackendLive])),
  BluetoothLayer.pipe(Layer.provide([BluetoothBackendLive])),
  NetworkLayer.pipe(Layer.provide([NetworkBackendLive])),
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
