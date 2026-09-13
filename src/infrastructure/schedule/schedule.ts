import GLib from 'gi://GLib'
import { createMemo, type Accessor } from 'ags'
import { Equal } from 'effect'

import type { CalendarDate, YearMonth } from '@/infrastructure/clock/derived/calendar'

import { scheduleState } from './bridge'
import { agendaFor, busyDays, type LocalDate, type ScheduleEvent } from './derived'

const local: LocalDate = (ms) => {
  const date = GLib.DateTime.new_from_unix_local(Math.floor(ms / 1000))
  return { year: date?.get_year() ?? 1970, month: date?.get_month() ?? 1, day: date?.get_day_of_month() ?? 1 }
}

const events = createMemo(() => scheduleState().events, { equals: Equal.equals })

export const schedule = {
  events,
  calendars: createMemo(() => scheduleState().calendars, { equals: Equal.equals }),
  agendaFor: (date: CalendarDate): readonly ScheduleEvent[] => agendaFor(events(), date, local),
  busyDays: (view: YearMonth): ReadonlySet<number> => busyDays(events(), view, local),
  local,
} as const

export type { ScheduleEvent }
export type ScheduleAccessor = Accessor<readonly ScheduleEvent[]>
