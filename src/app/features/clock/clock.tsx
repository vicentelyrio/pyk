import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import { clock } from '@/infrastructure/clock'

const cs = {
  root: 'clock',
  date: 'clock-date',
  time: 'clock-time',
}

export function Clock({ className }: { className?: string }) {
  return (
    <box class={clsx(cs.root, className)} valign={Gtk.Align.CENTER}>
      <label class={cs.date} label={clock.date} visible={clock.date.as(Boolean)} />
      <label class={cs.time} label={clock.time} />
    </box>
  )
}
