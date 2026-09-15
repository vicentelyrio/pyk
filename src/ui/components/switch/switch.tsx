import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import type { Accessor } from 'ags'

const cs = {
  root: 'switch',
  knob: 'switch-knob',

  on: '--on',
}

export type SwitchProps = {
  readonly on: Accessor<boolean>
  readonly onToggle: () => void
  readonly tooltip?: string
  readonly sensitive?: Accessor<boolean> | boolean
  readonly className?: string
}

export function Switch({ on, onToggle, tooltip, sensitive = true, className }: SwitchProps) {
  return (
    <button
      class={on.as((it) => clsx(cs.root, it && cs.on, className))}
      tooltipText={tooltip}
      sensitive={sensitive}
      focusable={false}
      valign={Gtk.Align.CENTER}
      hexpand={false}
      onClicked={onToggle}>
      <box class={cs.knob} halign={Gtk.Align.START} valign={Gtk.Align.CENTER} />
    </button>
  )
}
