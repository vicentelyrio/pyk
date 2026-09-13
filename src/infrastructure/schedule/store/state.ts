import type { ScheduleEvent } from '../derived/agenda'

export interface ScheduleState {
  readonly directory: string
  readonly calendars: readonly string[]
  readonly events: readonly ScheduleEvent[]
}

export const emptyState: ScheduleState = {
  directory: '',
  calendars: [],
  events: [],
}
