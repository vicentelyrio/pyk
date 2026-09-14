export type BrightnessSource = 'backlight' | 'ddcutil' | 'none'

export interface BrightnessState {
  readonly source: BrightnessSource
  readonly level: number
}

export const emptyState: BrightnessState = {
  source: 'none',
  level: 0,
}
