import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For, createComputed, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { clock, type CalendarDate } from '@/infrastructure/clock'
import { schedule, type ScheduleEvent } from '@/infrastructure/schedule'
import { tintFor } from '@/ui/tint'

const cs = {
  root: 'agenda',
  heading: 'agenda-heading',
  row: 'agenda-row',
  bar: 'agenda-bar',
  meta: 'agenda-meta',
  title: 'agenda-title',
  time: 'agenda-time',
  empty: 'agenda-empty',
}

function sameDay(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

function timeLabel(event: ScheduleEvent): string {
  if (event.allDay) return 'All day'

  const start = clock.formatTime(event.start)
  const endsLater = !sameDay(schedule.local(event.start), schedule.local(Math.max(event.start, event.end - 1)))
  const end = endsLater ? `${clock.formatDay(event.end)} ${clock.formatTime(event.end)}` : clock.formatTime(event.end)

  return event.end > event.start ? `${start} — ${end}` : start
}

export function Agenda({ date }: { readonly date: Accessor<CalendarDate> }) {
  const events = createComputed(() => schedule.agendaFor(date()))
  const heading = createComputed(() =>
    (sameDay(date(), clock.today()) ? 'Today' : clock.formatDate(date())).toUpperCase())

  return (
    <box
      class={cs.root}
      orientation={Gtk.Orientation.VERTICAL}
      visible={schedule.calendars.as((it) => it.length > 0)}>
      <label class={cs.heading} label={heading} xalign={0} />
      <For each={events} id={(it: ScheduleEvent) => it.id}>
        {(it: ScheduleEvent) => <AgendaRow event={it} />}
      </For>
      <label
        class={cs.empty}
        label="Nothing scheduled"
        xalign={0}
        visible={events.as((it) => it.length === 0)}
      />
    </box>
  )
}

function AgendaRow({ event }: { readonly event: ScheduleEvent }) {
  return (
    <box class={cs.row} tooltipText={event.location || event.calendar}>
      <box class={clsx(cs.bar, tintFor(event.calendar))} valign={Gtk.Align.CENTER} />
      <box class={cs.meta} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} hexpand>
        <label
          class={cs.title}
          label={event.title}
          xalign={0}
          ellipsize={Pango.EllipsizeMode.END}
          maxWidthChars={1}
          hexpand
        />
        <label class={cs.time} label={timeLabel(event)} xalign={0} />
      </box>
    </box>
  )
}
