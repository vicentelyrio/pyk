import { Gtk } from 'ags/gtk4'
import { For, createComputed, createState, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { Popover } from '@/ui/components'
import { clock, type CalendarDate, type DayCell, type YearMonth } from '@/infrastructure/clock'
import { config } from '@/infrastructure/config'
import { schedule } from '@/infrastructure/schedule'

import { Clock } from '../clock'
import { Agenda } from '../schedule'

const cs = {
  root: 'calendar',
  panel: 'calendar-panel',
  header: 'calendar-header',
  title: 'calendar-title',
  week: 'calendar-week',
  weekdays: 'calendar-weekdays',
  weekday: 'calendar-weekday',
  grid: 'calendar-grid',
  row: 'calendar-row',
  day: 'calendar-day',
  number: 'calendar-number',
  dot: 'calendar-dot',

  today: '--today',
  empty: '--empty',
  busy: '--busy',
  selected: '--selected',
}

const ROWS = 6
const COLUMNS = 7

export function Calendar({ className }: { className?: string }) {
  const [view, setView] = createState<YearMonth>(clock.today())
  const [selected, setSelected] = createState<CalendarDate>(clock.today())
  const month = createComputed(() => clock.monthView(view()))
  const busy = createComputed(() => schedule.busyDays(view()))

  const toToday = () => {
    setView(clock.today())
    setSelected(clock.today())
  }

  const select = (day: number) => setSelected({ ...view(), day })
  const shift = (delta: number) => setView(clock.shiftMonth(view(), delta))

  const attach = (self: Gtk.Widget) => {
    self.connect('map', toToday)

    const scroll = new Gtk.EventControllerScroll({
      flags: Gtk.EventControllerScrollFlags.VERTICAL | Gtk.EventControllerScrollFlags.DISCRETE,
      propagationPhase: Gtk.PropagationPhase.CAPTURE,
    })

    scroll.connect('scroll', (_controller, _dx, dy) => {
      if (dy !== 0) shift(dy > 0 ? 1 : -1)
      return true
    })

    self.add_controller(scroll)
  }

  return (
    <Popover
      className={clsx(cs.root, className)}
      contentClassName={cs.panel}
      tooltip="Calendar"
      trigger={<Clock />}>
      <box orientation={Gtk.Orientation.VERTICAL} $={attach}>
        <CalendarHeader month={month} onTitle={toToday} />
        <CalendarWeekdays />
        <CalendarGrid
          month={month}
          busy={busy}
          selected={createComputed(() => {
            const it = selected()
            const shown = view()
            return it.year === shown.year && it.month === shown.month ? it.day : null
          })}
          onSelect={select}
        />
        <Agenda date={selected} />
      </box>
    </Popover>
  )
}

type CalendarHeaderProps = {
  readonly month: Accessor<ReturnType<typeof clock.monthView>>
  readonly onTitle: () => void
}

function CalendarHeader({ month, onTitle }: CalendarHeaderProps) {
  return (
    <box class={cs.header}>
      <button class={cs.title} focusable={false} hexpand halign={Gtk.Align.START} onClicked={onTitle}>
        <label label={month.as((it) => clock.monthTitle(it))} xalign={0} />
      </button>
      <label
        class={cs.week}
        label={month.as((it) => `W${it.week}`)}
        visible={config.calendar.as((it) => it.showWeekNumber)}
      />
    </box>
  )
}

type Weekday = {
  readonly label: string
  readonly index: number
}

function CalendarWeekdays() {
  return (
    <box class={cs.weekdays} homogeneous>
      <For
        each={clock.weekdays.as((labels) => labels.map((label, index) => ({ label, index })))}
        id={(it: Weekday) => `${it.index}:${it.label}`}>
        {(it: Weekday) => <label class={cs.weekday} label={it.label} />}
      </For>
    </box>
  )
}

type CalendarGridProps = {
  readonly month: Accessor<ReturnType<typeof clock.monthView>>
  readonly busy: Accessor<ReadonlySet<number>>
  readonly selected: Accessor<number | null>
  readonly onSelect: (day: number) => void
}

function CalendarGrid({ month, busy, selected, onSelect }: CalendarGridProps) {
  return (
    <box class={cs.grid} orientation={Gtk.Orientation.VERTICAL}>
      {Array.from({ length: ROWS }, (_, row) => (
        <box class={cs.row} homogeneous visible={month.as((it) => it.rows.length > row)}>
          {Array.from({ length: COLUMNS }, (_, column) => (
            <CalendarDay
              cell={month.as((it) => it.rows[row]?.[column] ?? null)}
              busy={busy}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </box>
      ))}
    </box>
  )
}

type CalendarDayProps = {
  readonly cell: Accessor<DayCell | null>
  readonly busy: Accessor<ReadonlySet<number>>
  readonly selected: Accessor<number | null>
  readonly onSelect: (day: number) => void
}

function CalendarDay({ cell, busy, selected, onSelect }: CalendarDayProps) {
  const day = cell.as((it) => it?.day ?? null)

  const classes = createComputed(() => {
    const it = cell()
    const number = it?.day ?? null
    return clsx(
      cs.day,
      number === null && cs.empty,
      it?.today && cs.today,
      number !== null && !it?.today && selected() === number && cs.selected,
    )
  })

  const dot = createComputed(() => {
    const number = day()
    return clsx(cs.dot, number !== null && busy().has(number) && cs.busy)
  })

  return (
    <button
      class={classes}
      sensitive={day.as((it) => it !== null)}
      focusable={false}
      onClicked={() => {
        const number = day()
        if (number !== null) onSelect(number)
      }}>
      <overlay>
        <label class={cs.number} label={day.as((it) => (it === null ? '' : String(it)))} />
        <box $type="overlay" class={dot} halign={Gtk.Align.END} valign={Gtk.Align.START} />
      </overlay>
    </button>
  )
}
