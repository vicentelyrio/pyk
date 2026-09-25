import { Context, Stream } from 'effect'

import type { SourceError } from '@/infrastructure/effect'

import type { WeatherState } from './state'

export class WeatherBackend extends Context.Service<WeatherBackend, {
  readonly changes: Stream.Stream<WeatherState, SourceError>
}>()('pyk/WeatherBackend') {}
