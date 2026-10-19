import { Gtk } from 'ags/gtk4'
import type { Accessor } from 'ags'
import clsx from 'clsx'

export type DividerProps = {
  className?: string
  valign?: Gtk.Align
  visible?: boolean | Accessor<boolean>
}

export function Divider({ className, valign = Gtk.Align.CENTER, visible = true }: DividerProps) {
  return <box class={clsx('divider', className)} valign={valign} visible={visible} />
}
