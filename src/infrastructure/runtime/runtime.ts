import { createExternal, type Accessor } from 'ags'
import { Effect, Fiber, Layer, ManagedRuntime, Stream } from 'effect'

import { type PykError, report } from '@/infrastructure/effect'
import { Platform } from '@/infrastructure/effect/logger'
import { ConfigBackendLive } from '@/infrastructure/config/gjs/backend'
import { ConfigurationLayer, StartupConfigLayer } from '@/infrastructure/config/store/controller'
import { AppsBackendLive } from '@/infrastructure/apps/gjs/backend'
import { AppsLayer } from '@/infrastructure/apps/store/controller'
import { AudioBackendLive } from '@/infrastructure/audio/gjs/backend'
import { AudioLayer } from '@/infrastructure/audio/store/controller'
import { BluetoothBackendLive } from '@/infrastructure/bluetooth/gjs/backend'
import { BluetoothLayer } from '@/infrastructure/bluetooth/store/controller'
import { NetworkBackendLive } from '@/infrastructure/network/gjs/backend'
import { NetworkLayer } from '@/infrastructure/network/store/controller'
import { NiriIpcLive } from '@/infrastructure/niri/gjs/ipc'
import { NotificationsBackendLive } from '@/infrastructure/notifications/gjs/backend'
import { NotificationsLayer } from '@/infrastructure/notifications/store/controller'
import { NiriLayer } from '@/infrastructure/niri/store/controller'
import { MprisBackendLive } from '@/infrastructure/mpris/gjs/backend'
import { MprisLayer } from '@/infrastructure/mpris/store/controller'
import { NiriBindsLayer } from '@/infrastructure/shortcuts/gjs/layer'

const MainLayer = Layer.mergeAll(
  AppsLayer.pipe(Layer.provide([AppsBackendLive])),
  AudioLayer.pipe(Layer.provide([AudioBackendLive])),
  BluetoothLayer.pipe(Layer.provide([BluetoothBackendLive])),
  NetworkLayer.pipe(Layer.provide([NetworkBackendLive])),
  NiriLayer.pipe(Layer.provide([NiriIpcLive])),
  MprisLayer.pipe(Layer.provide([MprisBackendLive])),
  NotificationsLayer.pipe(Layer.provide([NotificationsBackendLive])),
  NiriBindsLayer,
).pipe(
  Layer.provideMerge([ConfigurationLayer]),
  Layer.provideMerge([Platform]),
  Layer.provideMerge([StartupConfigLayer]),
  Layer.provideMerge([ConfigBackendLive]),
)

export type Services = Layer.Success<typeof MainLayer>

export const runtime = ManagedRuntime.make(MainLayer)

export function createServiceAccessor<Shape, T>(
  init: T,
  service: Effect.Effect<Shape, never, Services>,
  changes: (svc: Shape) => Stream.Stream<T>,
): Accessor<T> {
  return createExternal(init, (set) => {
    let subscribed = false
    let pending: { readonly value: T } | null = null

    const deliver = (next: T) => {
      if (subscribed) set(next)
      else pending = { value: next }
    }

    const fiber = runtime.runFork(
      Effect.flatMap(service, (svc) =>
        Stream.runForEach(changes(svc), (next) => Effect.sync(() => deliver(next))),
      ),
    )

    Promise.resolve().then(() => {
      subscribed = true
      if (pending) set(pending.value)
      pending = null
    })

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
