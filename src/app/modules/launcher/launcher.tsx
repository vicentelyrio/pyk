import app from 'ags/gtk4/app'
import { Astal, Gtk } from 'ags/gtk4'
import { Launcher } from '@/app/features'

import { launcher } from './state'

const cs = {
  root: 'launcher-window',
}

export const LAUNCHER_WINDOW = 'launcher'

export function LauncherWindow() {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      name={LAUNCHER_WINDOW}
      class={cs.root}
      visible={launcher.open}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={app}
      $={(self) => dismissOutside(self as Gtk.Window)}>
      <Launcher open={launcher.open} onClose={launcher.hide} />
    </window>
  )
}

function dismissOutside(window: Gtk.Window) {
  const click = new Gtk.GestureClick()

  click.connect('pressed', (_gesture, _count, x, y) => {
    if (window.pick(x, y, Gtk.PickFlags.DEFAULT) === window) launcher.hide()
  })

  window.add_controller(click)
}
