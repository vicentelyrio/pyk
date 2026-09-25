import type Soup from 'gi://Soup?version=3.0'
import { Duration, Effect, Stream } from 'effect'

import type { WeatherConfig } from '@/infrastructure/config'
import { reconnecting, SourceError } from '@/infrastructure/effect'

import { decodeForecast, decodePlace, type Place } from '../derived'
import { emptyState, type WeatherState } from '../store/state'
import { getJson } from './http'

const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST = 'https://api.open-meteo.com/v1/forecast'

function query(params: Record<string, string | number>): string {
  return Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
}

function locate(session: Soup.Session, location: string): Effect.Effect<Place | null, SourceError> {
  return getJson(session, `${GEOCODE}?${query({ name: location, count: 1, format: 'json' })}`).pipe(
    Effect.map(decodePlace),
  )
}

function forecast(session: Soup.Session, place: Place, units: WeatherConfig['units']): Effect.Effect<WeatherState, SourceError> {
  const imperial = units === 'imperial'
  const url = `${FORECAST}?${query({
    latitude: place.latitude,
    longitude: place.longitude,
    current: 'temperature_2m,apparent_temperature,weather_code,is_day',
    hourly: 'temperature_2m,is_day',
    daily: 'temperature_2m_max,temperature_2m_min',
    temperature_unit: imperial ? 'fahrenheit' : 'celsius',
    timeformat: 'unixtime',
    timezone: 'auto',
    forecast_days: 2,
  })}`

  return getJson(session, url).pipe(
    Effect.flatMap((json) => {
      const state = decodeForecast(json, place.name, units)
      return state
        ? Effect.succeed(state)
        : Effect.fail(new SourceError({ domain: 'weather', reason: 'undecodable forecast' }))
    }),
  )
}

export function stateChanges(session: Soup.Session, settings: WeatherConfig): Stream.Stream<WeatherState, SourceError> {
  return Stream.unwrap(
    Effect.map(locate(session, settings.location), (place) => {
      if (!place) {
        return Stream.fromEffect(
          Effect.as(Effect.logWarning(`no place matches "${settings.location}"`), emptyState),
        )
      }

      return Stream.tick(Duration.millis(settings.refreshInterval)).pipe(
        Stream.mapEffect(() => forecast(session, place, settings.units)),
      )
    }),
  ).pipe(reconnecting)
}
