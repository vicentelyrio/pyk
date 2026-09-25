import { Effect, Layer, Stream } from 'effect'

import type { WeatherConfig } from '@/infrastructure/config'
import { Configuration } from '@/infrastructure/config/store/controller'

import { WeatherBackend } from '../store/backend'
import { stateChanges } from './connection'
import { makeSession } from './http'

function same(a: WeatherConfig, b: WeatherConfig): boolean {
  return a.location === b.location && a.units === b.units && a.refreshInterval === b.refreshInterval
}

export const WeatherBackendLive = Layer.effect(
  WeatherBackend,
  Effect.gen(function* () {
    const configuration = yield* Configuration
    const session = makeSession()

    return {
      changes: configuration.changes.pipe(
        Stream.map((config) => config.weather),
        Stream.changesWith(same),
        Stream.switchMap((settings) => stateChanges(session, settings)),
      ),
    }
  }),
)
