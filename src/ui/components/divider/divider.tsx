import { Gtk } from 'ags/gtk4'
import clsx from 'clsx'

export type DividerProps = {
  className?: string
  valign?: Gtk.Align
}

export function Divider({ className, valign = Gtk.Align.CENTER }: DividerProps) {
  return <box class={clsx('divider', className)} valign={valign} />
}
