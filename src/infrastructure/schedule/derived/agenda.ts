import type { CalendarDate, YearMonth } from '@/infrastructure/clock/derived/calendar'

export interface ScheduleEvent {
  readonly id: string
  readonly calendar: string
  readonly title: string
  readonly location: string
  readonly allDay: boolean
  readonly start: number
  readonly end: number
}

export type LocalDate = (ms: number) => CalendarDate

export function dayKey({ year, month, day }: CalendarDate): number {
  return year * 10_000 + month * 100 + day
}

function utcDate(ms: number): CalendarDate {
  const date = new Date(ms)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}

function span(event: ScheduleEvent, local: LocalDate): readonly [CalendarDate, CalendarDate] {
  const last = Math.max(event.start, event.end - 1)
  return event.allDay
    ? [utcDate(event.start), utcDate(last)]
    : [local(event.start), local(last)]
}

export function occursOn(event: ScheduleEvent, date: CalendarDate, local: LocalDate): boolean {
  const [first, last] = span(event, local)
  const key = dayKey(date)
  return dayKey(first) <= key && key <= dayKey(last)
}

export function agendaFor(
  events: readonly ScheduleEvent[],
  date: CalendarDate,
  local: LocalDate,
): readonly ScheduleEvent[] {
  return events
    .filter((event) => occursOn(event, date, local))
    .sort((a, b) =>
      Number(b.allDay) - Number(a.allDay)
      || a.start - b.start
      || a.title.localeCompare(b.title))
}

export function busyDays(
  events: readonly ScheduleEvent[],
  view: YearMonth,
  local: LocalDate,
): ReadonlySet<number> {
  const monthStart = dayKey({ ...view, day: 1 })
  const monthEnd = dayKey({ ...view, day: 31 })
  const days = new Set<number>()

  for (const event of events) {
    const [first, last] = span(event, local)
    const from = Math.max(dayKey(first), monthStart)
    const to = Math.min(dayKey(last), monthEnd)
    if (from > to) continue

    const cursor = new Date(Date.UTC(Math.floor(from / 10_000), (Math.floor(from / 100) % 100) - 1, from % 100))
    while (dayKey(utcDate(cursor.getTime())) <= to) {
      days.add(cursor.getUTCDate())
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
  }

  return days
}
