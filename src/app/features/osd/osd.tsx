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
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}>
      <label class={cs.value} label={feedback.as((it) => percent(it.value))} />
      <levelbar
        class={cs.track}
        orientation={Gtk.Orientation.VERTICAL}
        mode={Gtk.LevelBarMode.CONTINUOUS}
        inverted
        value={feedback.as((it) => it.value)}
        halign={Gtk.Align.CENTER}
        vexpand
      />
      <image class={cs.icon} iconName={feedback.as(icon)} halign={Gtk.Align.CENTER} />
    </box>
  )
}
