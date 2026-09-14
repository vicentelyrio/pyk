export interface BatteryState {
  readonly isPresent: boolean
  readonly percentage: number
  readonly isCharging: boolean
  readonly secondsLeft: number
  readonly icon: string
}

export const emptyState: BatteryState = {
  isPresent: false,
  percentage: 0,
  isCharging: false,
  secondsLeft: 0,
  icon: 'battery-missing-symbolic',
}
