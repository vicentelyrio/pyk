import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For, createComputed } from 'ags'
import { clock } from '@/infrastructure/clock'
import { LL } from '@/infrastructure/i18n'
import { schedule, type ScheduleEvent } from '@/infrastructure/schedule'

const cs = {
  root: 'today',
  date: 'today-date',
  month: 'today-month',
  day: 'today-day',
  events: 'today-events',
  row: 'today-row',
  title: 'today-title',
  time: 'today-time',
}

function format(ms: number, pattern: string): string {
  return GLib.DateTime.new_from_unix_local(Math.floor(ms / 1000))?.format(pattern) ?? ''
}

export function Today() {
  const month = createComputed(() => format(clock.now(), '%a %b').toUpperCase())
  const day = createComputed(() => format(clock.now(), '%d'))
  const events = createComputed(() => schedule.agendaFor(clock.today()))

  return (
    <box class={cs.root} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.END}>
      <box class={cs.date} halign={Gtk.Align.END}>
        <label class={cs.month} label={month} valign={Gtk.Align.BASELINE} />
        <label class={cs.day} label={day} valign={Gtk.Align.BASELINE} />
      </box>
      <box class={cs.events} orientation={Gtk.Orientation.VERTICAL} visible={events.as((it) => it.length > 0)}>
        <For each={events} id={(it: ScheduleEvent) => it.id}>
          {(event: ScheduleEvent) => (
            <box class={cs.row} halign={Gtk.Align.END} tooltipText={event.location || event.calendar}>
              <label class={cs.title} label={event.title} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={32} />
              <label
                class={cs.time}
                label={event.allDay ? LL().widgets.allDay() : clock.formatTime(event.start)}
                xalign={1}
              />
            </box>
          )}
        </For>
      </box>
    </box>
  )
}
