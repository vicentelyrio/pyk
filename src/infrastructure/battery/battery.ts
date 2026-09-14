import { createMemo } from 'ags'

import { batteryState } from './bridge'
import { batteryLabel } from './derived'

export const battery = {
  isPresent: createMemo(() => batteryState().isPresent),
  icon: createMemo(() => batteryState().icon),
  percentage: createMemo(() => batteryState().percentage),
  label: createMemo(() => {
    const { percentage, secondsLeft, isCharging } = batteryState()
    return batteryLabel(percentage, secondsLeft, isCharging)
  }),
} as const
