import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import { tintFor } from '@/ui/tint'

const cs = {
  root: 'avatar',
}

export type AvatarProps = {
  readonly name: string
  readonly className?: string
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <box
      class={clsx(cs.root, tintFor(name), className)}
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
