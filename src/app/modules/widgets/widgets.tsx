import app from 'ags/gtk4/app'
import { Astal, Gdk, Gtk } from 'ags/gtk4'
import { Player } from '@/app/features'

const cs = {
  root: 'widgets',
  column: 'widgets-column',
}

export function WidgetsWindow(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT } = Astal.WindowAnchor

  return (
    <window
      visible
      name={`widgets-${gdkmonitor.connector}`}
      namespace="pyk-widgets"
      class={cs.root}
      gdkmonitor={gdkmonitor}
      anchor={TOP | LEFT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.BOTTOM}
      keymode={Astal.Keymode.NONE}
      application={app}>
      <box
        class={cs.column}
        orientation={Gtk.Orientation.VERTICAL}
        halign={Gtk.Align.START}
        valign={Gtk.Align.START}>
        <Player />
      </box>
    </window>
  )
}
