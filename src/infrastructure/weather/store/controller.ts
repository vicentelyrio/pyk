import { Context, Effect, Layer, Stream } from 'effect'

import { makeStore } from '@/infrastructure/effect'

import { WeatherBackend } from './backend'
import { emptyState, type WeatherState } from './state'

export class Weather extends Context.Service<Weather, {
  readonly changes: Stream.Stream<WeatherState>
  readonly snapshot: Effect.Effect<WeatherState>
}>()('pyk/Weather') {}

export const WeatherLayer = Layer.effect(
  Weather,
  Effect.gen(function* () {
    const backend = yield* WeatherBackend
    return yield* makeStore('weather', emptyState, backend.changes)
  }),
)
