import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { emptyState, Weather, type WeatherState } from './store'

export const weatherState: Accessor<WeatherState> = createServiceAccessor(
  emptyState,
  Weather,
  (weather) => weather.changes,
)
