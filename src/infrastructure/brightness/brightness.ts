import { createMemo } from 'ags'

import { adjust, refresh, setLevel } from './actions'
import { brightnessState } from './bridge'

export const brightness = {
  isAvailable: createMemo(() => brightnessState().source !== 'none'),
  level: createMemo(() => brightnessState().level),
  setLevel,
  adjust,
  refresh,
} as const
