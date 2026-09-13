import { Gtk } from 'ags/gtk4'
import { For, createComputed, createState, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { Popover } from '@/ui/components'
import { clock, type DayCell, type YearMonth } from '@/infrastructure/clock'
import { config } from '@/infrastructure/config'

import { Clock } from '../clock'

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

  today: '--today',
  empty: '--empty',
}

export function Calendar({ className }: { className?: string }) {
  const [view, setView] = createState<YearMonth>(clock.today())
  const month = createComputed(() => clock.monthView(view()))

  const toToday = () => setView(clock.today())
  const shift = (delta: number) => setView(clock.shiftMonth(view(), delta))

  const attach = (self: Gtk.Widget) => {
    self.connect('map', toToday)

    const scroll = new Gtk.EventControllerScroll({
      flags: Gtk.EventControllerScrollFlags.VERTICAL | Gtk.EventControllerScrollFlags.DISCRETE,
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
        <CalendarGrid rows={month.as((it) => it.rows)} />
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

function CalendarGrid({ rows }: { readonly rows: Accessor<readonly (readonly DayCell[])[]> }) {
  return (
    <box class={cs.grid} orientation={Gtk.Orientation.VERTICAL}>
      <For each={rows} id={(row: readonly DayCell[]) => row.map((it) => `${it.key}${it.today ? '*' : ''}`).join('|')}>
        {(row: readonly DayCell[]) => (
          <box class={cs.row} homogeneous>
            {row.map((cell) => (
              <label
                class={clsx(cs.day, cell.today && cs.today, cell.day === null && cs.empty)}
                label={cell.day === null ? '' : String(cell.day)}
              />
            ))}
          </box>
        )}
      </For>
    </box>
  )
}
