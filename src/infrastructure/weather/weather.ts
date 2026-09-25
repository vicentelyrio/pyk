import GLib from 'gi://GLib'
import { createComputed, createMemo } from 'ags'
import { Equal } from 'effect'

import { clock } from '@/infrastructure/clock'
import { config } from '@/infrastructure/config'

import { weatherState } from './bridge'
import { conditionOf, degrees, labelOf, upcoming } from './derived'

const FORECAST_COUNT = 4
const FORECAST_STEP = 2

export interface ForecastSlot {
  readonly time: string
  readonly temperature: string
  readonly value: number
  readonly isDay: boolean
}

function hourLabel(ms: number): string {
  const pattern = config.clock().hourFormat === '12h' ? '%-l%P' : '%Hh'
  return GLib.DateTime.new_from_unix_local(Math.floor(ms / 1000))?.format(pattern)?.trim() ?? ''
}

const hours = createMemo(() => weatherState().hours, { equals: Equal.equals })

export const weather = {
  isAvailable: createMemo(() => weatherState().isAvailable),
  place: createMemo(() => weatherState().place),
  temperature: createMemo(() => degrees(weatherState().temperature)),
  low: createMemo(() => degrees(weatherState().low)),
  high: createMemo(() => degrees(weatherState().high)),
  apparent: createMemo(() => degrees(weatherState().apparent)),
  condition: createMemo(() => conditionOf(weatherState().code)),
  label: createMemo(() => labelOf(weatherState().code)),
  isDay: createMemo(() => weatherState().isDay),
  forecast: createComputed((): readonly ForecastSlot[] =>
    upcoming(hours(), clock.now(), FORECAST_COUNT, FORECAST_STEP).map((it) => ({
      time: hourLabel(it.time),
      temperature: degrees(it.temperature),
      value: it.temperature,
      isDay: it.isDay,
    }))),
} as const
