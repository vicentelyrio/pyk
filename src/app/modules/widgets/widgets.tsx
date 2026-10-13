import app from 'ags/gtk4/app'
import { Astal, Gdk, Gtk } from 'ags/gtk4'
import { For, createComputed, type Accessor } from 'ags'
import { Meters, Player, Today, Todos, Weather } from '@/app/features'
import { config } from '@/infrastructure/config'
import { layoutFor, type WidgetId } from '@/infrastructure/config/schema'
import { monitor } from '@/infrastructure/monitor'
import { mpris } from '@/infrastructure/mpris'
import { todos } from '@/infrastructure/todos'
import { weather } from '@/infrastructure/weather'
import { alignFor, type Side } from '@/ui/side'

const cs = {
  root: 'widgets',
  column: 'widgets-column',
  slot: 'widgets-slot',
  rule: 'widgets-rule',
  start: '--start',
  end: '--end',
}

type Entry = {
  readonly view: (side: Side) => JSX.Element
  readonly visible: Accessor<boolean>
}

function catalog(): Readonly<Record<WidgetId, Entry>> {
  return {
    today: { view: (side) => <Today side={side} />, visible: createComputed(() => true) },
    todos: { view: (side) => <Todos side={side} />, visible: todos.items.as((it) => it.length > 0) },
    player: { view: () => <Player />, visible: mpris.hasPlayer },
    weather: { view: (side) => <Weather side={side} />, visible: weather.isAvailable },
    meters: { view: () => <Meters />, visible: monitor.meters.as((it) => it.length > 0) },
  }
}

export function WidgetsWindow(gdkmonitor: Gdk.Monitor) {
  const entries = catalog()
  const layout = createComputed(() => layoutFor(config.widgets().layout, gdkmonitor.connector ?? ''))

  return [
    <WidgetsColumn side="start" gdkmonitor={gdkmonitor} entries={entries} ids={layout.as((it) => it.start)} />,
    <WidgetsColumn side="end" gdkmonitor={gdkmonitor} entries={entries} ids={layout.as((it) => it.end)} />,
  ]
}

type ColumnProps = {
  readonly side: Side
  readonly gdkmonitor: Gdk.Monitor
  readonly entries: Readonly<Record<WidgetId, Entry>>
  readonly ids: Accessor<readonly WidgetId[]>
}

function WidgetsColumn({ side, gdkmonitor, entries, ids }: ColumnProps) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
  const shown = createComputed(() => ids().filter((id) => entries[id].visible()))
  const align = alignFor(side)

  return (
    <window
      visible={shown.as((it) => it.length > 0)}
      name={`widgets-${side}-${gdkmonitor.connector}`}
      namespace="pyk-widgets"
      class={cs.root}
      gdkmonitor={gdkmonitor}
      anchor={TOP | (side === 'start' ? LEFT : RIGHT)}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.BOTTOM}
      keymode={Astal.Keymode.NONE}
      application={app}>
      <box
        class={`${cs.column} ${side === 'start' ? cs.start : cs.end}`}
        orientation={Gtk.Orientation.VERTICAL}
        halign={align}
        valign={Gtk.Align.START}>
        <For each={ids}>
          {(id: WidgetId) => (
            <box class={cs.slot} orientation={Gtk.Orientation.VERTICAL} visible={entries[id].visible}>
              <box class={cs.rule} halign={align} visible={shown.as((it) => it[0] !== id)} />
              {entries[id].view(side)}
            </box>
          )}
        </For>
      </box>
    </window>
  )
}
