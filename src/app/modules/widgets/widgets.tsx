import app from 'ags/gtk4/app'
import { Astal, Gdk, Gtk } from 'ags/gtk4'
import type { Accessor } from 'ags'
import { Meters, Player, Today, Todos, Weather } from '@/app/features'
import { monitor } from '@/infrastructure/monitor'
import { mpris } from '@/infrastructure/mpris'
import { todos } from '@/infrastructure/todos'
import { weather } from '@/infrastructure/weather'

const cs = {
  root: 'widgets',
  column: 'widgets-column',
  start: '--start',
  end: '--end',
  rule: 'widgets-rule',
}

export function WidgetsWindow(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return [
    <window
      visible={mpris.hasPlayer}
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
        class={`${cs.column} ${cs.start}`}
        orientation={Gtk.Orientation.VERTICAL}
        halign={Gtk.Align.START}
        valign={Gtk.Align.START}>
        <Player />
      </box>
    </window>,
    <window
      visible
      name={`widgets-info-${gdkmonitor.connector}`}
      namespace="pyk-widgets"
      class={cs.root}
      gdkmonitor={gdkmonitor}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.BOTTOM}
      keymode={Astal.Keymode.NONE}
      application={app}>
      <box
        class={`${cs.column} ${cs.end}`}
        orientation={Gtk.Orientation.VERTICAL}
        halign={Gtk.Align.END}
        valign={Gtk.Align.START}>
        <Weather />
        <Rule visible={weather.isAvailable} />
        <Today />
        <Rule visible={todos.items.as((it) => it.length > 0)} />
        <Todos />
        <Rule visible={monitor.meters.as((it) => it.length > 0)} />
        <Meters />
      </box>
    </window>,
  ]
}

function Rule({ visible }: { readonly visible: Accessor<boolean> }) {
  return <box class={cs.rule} halign={Gtk.Align.END} visible={visible} />
}
