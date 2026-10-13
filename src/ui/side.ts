import { Gtk } from 'ags/gtk4'

export type Side = 'start' | 'end'

export function alignFor(side: Side): Gtk.Align {
  return side === 'start' ? Gtk.Align.START : Gtk.Align.END
}

export function edgeFirst<T>(side: Side, edge: T, inner: T): T[] {
  return side === 'start' ? [edge, inner] : [inner, edge]
}
