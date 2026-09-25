export type WeatherUnits = 'metric' | 'imperial'

export interface WeatherHour {
  readonly time: number
  readonly temperature: number
  readonly isDay: boolean
}

export interface WeatherState {
  readonly isAvailable: boolean
  readonly place: string
  readonly units: WeatherUnits
  readonly temperature: number
  readonly apparent: number
  readonly low: number
  readonly high: number
  readonly code: number
  readonly isDay: boolean
  readonly hours: readonly WeatherHour[]
}

export const emptyState: WeatherState = {
  isAvailable: false,
  place: '',
  units: 'metric',
  temperature: 0,
  apparent: 0,
  low: 0,
  high: 0,
  code: 0,
  isDay: true,
  hours: [],
}
