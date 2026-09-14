import { createMemo } from 'ags'

import { refresh, setLevel } from './actions'
import { brightnessState } from './bridge'

export const brightness = {
  isAvailable: createMemo(() => brightnessState().source !== 'none'),
  level: createMemo(() => brightnessState().level),
  setLevel,
  refresh,
} as const
