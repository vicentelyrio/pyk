import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For, createComputed } from 'ags'
import { clock } from '@/infrastructure/clock'
import { LL } from '@/infrastructure/i18n'
import { schedule, type ScheduleEvent } from '@/infrastructure/schedule'
import { alignFor, edgeFirst, type Side } from '@/ui/side'

const cs = {
  root: 'today',
  date: 'today-date',
  names: 'today-names',
  weekday: 'today-weekday',
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

export function Today({ side }: { readonly side: Side }) {
  const weekday = createComputed(() => format(clock.now(), '%A').toUpperCase())
  const month = createComputed(() => format(clock.now(), '%B').toUpperCase())
  const day = createComputed(() => format(clock.now(), '%d'))
  const events = createComputed(() => schedule.agendaFor(clock.today()))

  const align = alignFor(side)

  return (
    <box class={cs.root} orientation={Gtk.Orientation.VERTICAL} halign={align}>
      <box class={cs.date} halign={align}>
        {edgeFirst(
          side,
          <label class={cs.day} label={day} valign={Gtk.Align.CENTER} />,
          <box class={cs.names} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
            <label class={cs.weekday} label={weekday} xalign={side === 'start' ? 0 : 1} />
            <label class={cs.month} label={month} xalign={side === 'start' ? 0 : 1} />
          </box>,
        )}
      </box>
      <box class={cs.events} orientation={Gtk.Orientation.VERTICAL} visible={events.as((it) => it.length > 0)}>
        <For each={events} id={(it: ScheduleEvent) => it.id}>
          {(event: ScheduleEvent) => (
            <box class={cs.row} halign={align} tooltipText={event.location || event.calendar}>
              {edgeFirst(
                side,
                <label
                  class={cs.time}
                  label={event.allDay ? LL().widgets.allDay() : clock.formatTime(event.start)}
                  xalign={side === 'start' ? 0 : 1}
                />,
                <label class={cs.title} label={event.title} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={32} />,
              )}
            </box>
          )}
        </For>
      </box>
    </box>
  )
}
