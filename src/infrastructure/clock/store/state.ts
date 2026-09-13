export interface ClockState {
  readonly now: number
}

export const emptyState: ClockState = {
  now: 0,
}
