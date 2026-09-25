import { Duration, Effect, Layer, Stream } from 'effect'

import { Configuration } from '@/infrastructure/config/store/controller'

import { advance, emptyHistory, toState } from '../derived'
import { MonitorBackend } from '../store/backend'
import { findTempSensor, read } from './read'

export const MonitorBackendLive = Layer.effect(
  MonitorBackend,
  Effect.gen(function* () {
    const configuration = yield* Configuration
    const sensor = findTempSensor()

    return {
      changes: configuration.changes.pipe(
        Stream.map((config) => config.monitor.interval),
        Stream.changes,
        Stream.switchMap((interval) =>
          Stream.tick(Duration.millis(interval)).pipe(
            Stream.map(() => read(sensor)),
            Stream.scan(emptyHistory, advance),
            Stream.map(toState),
          )),
      ),
    }
  }),
)
