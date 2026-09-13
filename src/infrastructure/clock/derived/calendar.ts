export interface CalendarDate {
  readonly year: number
  readonly month: number
  readonly day: number
}

export interface YearMonth {
  readonly year: number
  readonly month: number
}

export type WeekStart = 'monday' | 'sunday'

export interface DayCell {
  readonly key: string
  readonly day: number | null
  readonly today: boolean
}

export interface MonthView extends YearMonth {
  readonly week: number
  readonly rows: readonly (readonly DayCell[])[]
}

const DAY = 86_400_000

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

export function daysInMonth({ year, month }: YearMonth): number {
  return utc(year, month + 1, 0).getUTCDate()
}

export function weekday({ year, month, day }: CalendarDate): number {
  return utc(year, month, day).getUTCDay()
}

export function isoWeek({ year, month, day }: CalendarDate): number {
  const date = utc(year, month, day)
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  return Math.ceil(((date.getTime() - start) / DAY + 1) / 7)
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export function sameMonth(a: YearMonth, b: YearMonth): boolean {
  return a.year === b.year && a.month === b.month
}

export function monthView(view: YearMonth, today: CalendarDate, weekStart: WeekStart): MonthView {
  const first = weekday({ ...view, day: 1 })
  const lead = (first - (weekStart === 'monday' ? 1 : 0) + 7) % 7
  const length = daysInMonth(view)
  const total = Math.ceil((lead + length) / 7) * 7
  const prefix = `${view.year}-${view.month}`

  const cells: DayCell[] = Array.from({ length: total }, (_, index) => {
    const day = index - lead + 1
    const inMonth = day >= 1 && day <= length

    return {
      key: `${prefix}:${index}`,
      day: inMonth ? day : null,
      today: inMonth && sameMonth(view, today) && day === today.day,
    }
  })

  const rows: DayCell[][] = []
  for (let at = 0; at < cells.length; at += 7) rows.push(cells.slice(at, at + 7))

  const week = isoWeek(sameMonth(view, today) ? today : { ...view, day: 1 })

  return { ...view, week, rows }
}
