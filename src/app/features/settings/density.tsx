import { Gtk } from 'ags/gtk4'
import { createComputed } from 'ags'
import { clsx } from 'clsx'
import { config } from '@/infrastructure/config'
import { LL } from '@/infrastructure/i18n'

const cs = {
  row: 'set-row',
  head: 'set-head',
  labels: 'set-labels',
  label: 'set-label',
  hint: 'set-hint',
  control: 'set-control',
  segmented: 'set-segmented',
  option: 'set-option',

  on: '--on',
}

type PresetId = 'small' | 'medium' | 'large'

type Preset = {
  readonly id: PresetId
  readonly fontSize: number
  readonly sizeBase: number
}

const PRESETS: readonly Preset[] = [
  { id: 'small', fontSize: 16, sizeBase: 4 },
  { id: 'medium', fontSize: 19, sizeBase: 5 },
  { id: 'large', fontSize: 22, sizeBase: 6 },
]

export function DensityRow() {
  const t = LL().settings.density

  const current = createComputed(() => {
    const { fontSize, sizeBase } = config.appearance()
    const match = PRESETS.find((it) => it.fontSize === fontSize && it.sizeBase === sizeBase)

    return match?.id ?? 'custom'
  })

  return (
    <box class={cs.row} orientation={Gtk.Orientation.VERTICAL}>
      <box class={cs.head}>
        <box class={cs.labels} orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label class={cs.label} label={t.label()} xalign={0} wrap maxWidthChars={1} />
          <label class={cs.hint} label={t.hint()} xalign={0} wrap maxWidthChars={1} />
        </box>

        <box class={cs.control} halign={Gtk.Align.END} valign={Gtk.Align.START}>
          <box class={cs.segmented}>
            {PRESETS.map((preset) => (
              <button
                class={current.as((it) => clsx(cs.option, it === preset.id && cs.on))}
                focusable={false}
                onClicked={() => config.write({
                  appearance: { fontSize: preset.fontSize, sizeBase: preset.sizeBase },
                })}>
                <label label={t[preset.id]()} />
              </button>
            ))}
            <box
              class={clsx(cs.option, cs.on)}
              visible={current.as((it) => it === 'custom')}>
              <label label={t.custom()} />
            </box>
          </box>
        </box>
      </box>
    </box>
  )
}
