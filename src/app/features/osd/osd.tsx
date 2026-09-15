import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import type { Accessor } from 'ags'

export type OsdKind = 'volume' | 'brightness'

export interface OsdFeedback {
  readonly kind: OsdKind
  readonly value: number
  readonly muted: boolean
}

const cs = {
  root: 'osd-panel',
  icon: 'osd-icon',
  track: 'osd-track',
  value: 'osd-value',

  muted: '--muted',
}

const icons = {
  volume: 'pyk-volume-symbolic',
  volumeMuted: 'pyk-volume-muted-symbolic',
  brightness: 'pyk-brightness-symbolic',
}

function icon(feedback: OsdFeedback): string {
  if (feedback.kind === 'brightness') return icons.brightness
  return feedback.muted ? icons.volumeMuted : icons.volume
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function Osd({ feedback }: { readonly feedback: Accessor<OsdFeedback> }) {
  return (
    <box
      class={feedback.as((it) => clsx(cs.root, it.muted && cs.muted))}
      valign={Gtk.Align.CENTER}>
      <image class={cs.icon} iconName={feedback.as(icon)} valign={Gtk.Align.CENTER} />
      <levelbar
        class={cs.track}
        mode={Gtk.LevelBarMode.CONTINUOUS}
        value={feedback.as((it) => it.value)}
        valign={Gtk.Align.CENTER}
        hexpand
      />
      <label class={cs.value} label={feedback.as((it) => percent(it.value))} xalign={1} />
    </box>
  )
}
