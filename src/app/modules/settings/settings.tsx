import app from 'ags/gtk4/app'
import { Astal, Gtk } from 'ags/gtk4'
import { Settings } from '@/app/features'

import { settings } from './state'

const cs = {
  root: 'settings-window',
}

export const SETTINGS_WINDOW = 'settings'

export function SettingsWindow() {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      name={SETTINGS_WINDOW}
      class={cs.root}
      visible={settings.open}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={app}
      $={(self) => dismissOutside(self as Gtk.Window)}>
      <Settings section={settings.section} onSection={settings.select} onClose={settings.hide} />
    </window>
  )
}

function dismissOutside(window: Gtk.Window) {
  const click = new Gtk.GestureClick()

  click.connect('pressed', (_gesture, _count, x, y) => {
    if (window.pick(x, y, Gtk.PickFlags.DEFAULT) === window) settings.hide()
  })

  window.add_controller(click)
}
