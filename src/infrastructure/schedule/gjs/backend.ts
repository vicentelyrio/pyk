import GLib from 'gi://GLib'
import { Effect, Layer, Stream } from 'effect'

import { Clock } from '@/infrastructure/clock/store/controller'
import { expandHome } from '@/infrastructure/config/schema'
import { Configuration } from '@/infrastructure/config/store/controller'

import { ScheduleBackend } from '../store/backend'
import { stateChanges } from './connection'

function windowAround(now: number) {
  const date = GLib.DateTime.new_from_unix_local(Math.floor(now / 1000))!
  const start = GLib.DateTime.new_local(date.get_year(), date.get_month(), 1, 0, 0, 0)!.add_months(-1)!
  const end = start.add_months(14)!
  return { key: `${date.get_year()}-${date.get_day_of_year()}`, from: start.to_unix() * 1000, to: end.to_unix() * 1000 }
}

export const ScheduleBackendLive = Layer.effect(
  ScheduleBackend,
  Effect.gen(function* () {
    const configuration = yield* Configuration
    const clock = yield* Clock
    const home = GLib.get_home_dir()

    const directories = configuration.changes.pipe(
      Stream.map((config) => expandHome(config.schedule.directory, home)),
      Stream.changes,
    )

    const windows = clock.changes.pipe(
      Stream.map(({ now }) => windowAround(now || Date.now())),
      Stream.changesWith((a, b) => a.key === b.key),
    )

    return {
      changes: stateChanges(
        Stream.zipLatest(directories, windows).pipe(
          Stream.map(([directory, window]) => ({ directory, window: { from: window.from, to: window.to } })),
        ),
      ),
    }
  }),
)
