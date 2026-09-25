export type MeterId = 'cpu' | 'mem' | 'net' | 'temp'

export interface Meter {
  readonly id: MeterId
  readonly value: string
  readonly series: readonly number[]
}

export interface MonitorState {
  readonly meters: readonly Meter[]
}

export const emptyState: MonitorState = {
  meters: [],
}
