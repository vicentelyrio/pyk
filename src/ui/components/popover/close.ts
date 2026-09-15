import GLib from 'gi://GLib'
import { Gtk } from 'ags/gtk4'

const SETTLE = 200

export function closePopover(from: Gtk.Widget, then?: () => void): void {
  const popover = from.get_ancestor(Gtk.Popover.$gtype) as Gtk.Popover | null
  popover?.popdown()

  if (!then) return

  GLib.timeout_add(GLib.PRIORITY_DEFAULT, SETTLE, () => {
    then()
    return GLib.SOURCE_REMOVE
  })
}
