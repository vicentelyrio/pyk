import { Gtk } from 'ags/gtk4'
import { For, createComputed } from 'ags'
import { clsx } from 'clsx'
import { LL } from '@/infrastructure/i18n'
import { monitor, type Meter, type MeterId } from '@/infrastructure/monitor'
import { Plot } from '@/ui/components'

const cs = {
  root: 'meters',
  row: 'meter',
  label: 'meter-label',
  plot: 'meter-plot',
  value: 'meter-value',
}

const tints: Readonly<Record<MeterId, string>> = {
  cpu: '--accent',
  mem: '--warn',
  net: '--info',
  temp: '--ok',
}

export function Meters() {
  return (
    <box class={cs.root} orientation={Gtk.Orientation.VERTICAL} visible={monitor.meters.as((it) => it.length > 0)}>
      <For each={monitor.meters} id={(it: Meter) => it.id}>
        {(it: Meter) => <MeterRow id={it.id} />}
      </For>
    </box>
  )
}

function MeterRow({ id }: { readonly id: MeterId }) {
  const meter = createComputed(() => monitor.meters().find((it) => it.id === id))
  const series = createComputed(() => meter()?.series ?? [])

  return (
    <box class={cs.row}>
      <label class={cs.label} label={LL().widgets.meters[id]()} xalign={0} />
      <Plot className={clsx(cs.plot, tints[id])} values={series} capacity={monitor.capacity} />
      <label class={cs.value} label={meter.as((it) => it?.value ?? '')} xalign={1} />
    </box>
  )
}
