import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'

const cs = {
  root: 'avatar',
}

const TINTS = ['--accent', '--info', '--ok', '--warn', '--attention'] as const

export type AvatarProps = {
  readonly name: string
  readonly className?: string
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <box
      class={clsx(cs.root, tint(name), className)}
      valign={Gtk.Align.START}
      hexpand={false}
      vexpand={false}>
      <label
        label={initial(name)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        hexpand
        vexpand
      />
    </box>
  )
}

function initial(name: string): string {
  return (name.trim().charAt(0) || '?').toUpperCase()
}

function tint(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % TINTS.length
  return TINTS[hash]!
}
