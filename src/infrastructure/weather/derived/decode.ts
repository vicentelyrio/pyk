import type { WeatherHour, WeatherState, WeatherUnits } from '../store/state'

export interface Place {
  readonly name: string
  readonly latitude: number
  readonly longitude: number
}

type Json = Record<string, unknown>

function record(input: unknown): Json | null {
  return typeof input === 'object' && input !== null && !Array.isArray(input) ? input as Json : null
}

function numbers(input: unknown): readonly number[] | null {
  return Array.isArray(input) && input.every((it) => typeof it === 'number') ? input : null
}

function num(input: unknown): number | null {
  return typeof input === 'number' && Number.isFinite(input) ? input : null
}

export function decodePlace(input: unknown): Place | null {
  const results = record(input)?.results
  const first = Array.isArray(results) ? record(results[0]) : null
  if (!first) return null

  const name = first.name
  const latitude = num(first.latitude)
  const longitude = num(first.longitude)

  return typeof name === 'string' && latitude !== null && longitude !== null ? { name, latitude, longitude } : null
}

export function decodeForecast(input: unknown, place: string, units: WeatherUnits): WeatherState | null {
  const root = record(input)
  const current = record(root?.current)
  const hourly = record(root?.hourly)
  const daily = record(root?.daily)
  if (!current || !hourly || !daily) return null

  const temperature = num(current.temperature_2m)
  const apparent = num(current.apparent_temperature)
  const code = num(current.weather_code)
  const isDay = num(current.is_day)
  const high = numbers(daily.temperature_2m_max)?.[0]
  const low = numbers(daily.temperature_2m_min)?.[0]
  const times = numbers(hourly.time)
  const temperatures = numbers(hourly.temperature_2m)
  const days = numbers(hourly.is_day)

  if (temperature === null || apparent === null || code === null || isDay === null) return null
  if (high === undefined || low === undefined || !times || !temperatures || !days) return null

  const hours: WeatherHour[] = times.flatMap((time, at) => {
    const value = temperatures[at]
    return value === undefined ? [] : [{ time: time * 1000, temperature: value, isDay: days[at] === 1 }]
  })

  return {
    isAvailable: true,
    place,
    units,
    temperature,
    apparent,
    low,
    high,
    code,
    isDay: isDay === 1,
    hours,
  }
}
