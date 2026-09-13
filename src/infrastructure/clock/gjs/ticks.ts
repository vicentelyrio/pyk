import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import { Effect, Queue, Stream } from 'effect'

import { delayToNextTick, floorToUnit } from '../derived/ticks'

function wallClock(): number {
  return Math.floor(GLib.get_real_time() / 1000)
}

export function ticks(unitMs: number): Stream.Stream<number> {
  return Stream.callback<number>(
    (queue) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          let timer = 0

          const emit = () => {
            const now = wallClock()
            Queue.offerUnsafe(queue, floorToUnit(now, unitMs))
            return now
          }

          const schedule = (now: number) => {
            if (timer) GLib.source_remove(timer)
            timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delayToNextTick(now, unitMs), () => {
              timer = 0
              schedule(emit())
              return GLib.SOURCE_REMOVE
            })
          }

          schedule(emit())

          const resumed = Gio.DBus.system.signal_subscribe(
            'org.freedesktop.login1',
            'org.freedesktop.login1.Manager',
            'PrepareForSleep',
            '/org/freedesktop/login1',
            null,
            Gio.DBusSignalFlags.NONE,
            (_connection, _sender, _path, _iface, _signal, params) => {
              const [sleeping] = params.deepUnpack() as [boolean]
              if (!sleeping) schedule(emit())
            },
          )

          return { stop: () => timer && GLib.source_remove(timer), resumed }
        }),
        ({ stop, resumed }) =>
          Effect.sync(() => {
            stop()
            Gio.DBus.system.signal_unsubscribe(resumed)
          }),
      ),
    { bufferSize: 1, strategy: 'sliding' },
  )
}
