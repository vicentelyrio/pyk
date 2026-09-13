import GLib from 'gi://GLib'
import { createComputed, createMemo } from 'ags'
import { Equal } from 'effect'

import { config } from '@/infrastructure/config'

import { clockState } from './bridge'
import { monthView, shiftMonth, type CalendarDate, type YearMonth } from './derived'

const REFERENCE_MONDAY = { year: 2024, month: 1, day: 1 }

function local(now: number): GLib.DateTime | null {
  return GLib.DateTime.new_from_unix_local(Math.floor(now / 1000))
}

function format(now: number, pattern: string): string {
  return local(now)?.format(pattern) ?? ''
}

function monthTitle({ year, month }: YearMonth): string {
  return GLib.DateTime.new_local(year, month, 1, 0, 0, 0)?.format('%B %Y') ?? ''
}

function weekdayInitials(weekStart: 'monday' | 'sunday'): readonly string[] {
  const offset = weekStart === 'monday' ? 0 : -1
  return Array.from({ length: 7 }, (_, index) => {
    const date = GLib.DateTime.new_local(REFERENCE_MONDAY.year, REFERENCE_MONDAY.month, REFERENCE_MONDAY.day + 7 + index + offset, 0, 0, 0)
    return (date?.format('%a') ?? '').charAt(0).toUpperCase()
  })
}

const now = createMemo(() => clockState().now)

function timePattern(): string {
  const { hourFormat } = config.clock()
  return hourFormat === '12h' ? '%-I:%M %p' : '%H:%M'
}

const today = createMemo((): CalendarDate => {
  const date = local(now())
  return { year: date?.get_year() ?? 1970, month: date?.get_month() ?? 1, day: date?.get_day_of_month() ?? 1 }
}, { equals: Equal.equals })

export const clock = {
  now,
  today,
  time: createComputed(() => {
    const { hourFormat, showSeconds } = config.clock()
    const hours = hourFormat === '12h' ? '%-I' : '%H'
    const suffix = hourFormat === '12h' ? ' %p' : ''
    return format(now(), `${hours}:%M${showSeconds ? ':%S' : ''}${suffix}`)
  }),
  date: createComputed(() => {
    const { showDate, dateFormat } = config.clock()
    return showDate ? format(now(), dateFormat) : ''
  }),
  weekdays: createComputed(() => weekdayInitials(config.calendar().weekStart)),
  monthView: (view: YearMonth) => monthView(view, today(), config.calendar().weekStart),
  monthTitle,
  formatTime: (ms: number) => format(ms, timePattern()),
  formatDay: (ms: number) => format(ms, config.clock().dateFormat),
  formatDate: ({ year, month, day }: CalendarDate) =>
    GLib.DateTime.new_local(year, month, day, 0, 0, 0)?.format(config.clock().dateFormat) ?? '',
  shiftMonth,
} as const
