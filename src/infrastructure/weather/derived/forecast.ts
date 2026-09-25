import type { WeatherHour } from '../store/state'

const HOUR = 3_600_000

export function upcoming(hours: readonly WeatherHour[], now: number, count: number, step: number): readonly WeatherHour[] {
  return hours
    .filter((it) => it.time >= now + HOUR)
    .filter((_, at) => at % step === 0)
    .slice(0, count)
}

export function degrees(value: number): string {
  return `${Math.round(value)}°`
}
