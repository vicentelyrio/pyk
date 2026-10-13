import app from 'ags/gtk4/app'
import { Gtk } from 'ags/gtk4'
import { For, createComputed, createState, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { DEFAULT_LAYOUT, type Layout, type LayoutLeaf } from '@/infrastructure/config/schema'
import { LL } from '@/infrastructure/i18n'
import type { Side } from '@/ui/side'

const cs = {
  root: 'set-layout',
  targets: 'set-segmented',
  target: 'set-option',
  status: 'set-layout-status',
  note: 'set-layout-note',
  columns: 'set-layout-columns',
  column: 'set-layout-column',
  table: 'set-table',
  head: 'set-table-head',
  col: 'set-table-col',
  row: 'set-table-row',
  name: 'set-table-value',
  action: 'set-table-clear',
  empty: 'set-table-empty',
  adds: 'set-layout-adds',
  add: 'set-add',

  on: '--on',
}

const icons = {
  up: 'pyk-chevron-up-symbolic',
  down: 'pyk-chevron-down-symbolic',
  toStart: 'pyk-chevron-left-symbolic',
  toEnd: 'pyk-chevron-right-symbolic',
  drop: 'pyk-x-symbolic',
  add: 'pyk-plus-symbolic',
  reset: 'pyk-reset-symbolic',
}

type Layouts = Readonly<Record<string, Layout>>

type LayoutControlProps = {
  readonly leaf: LayoutLeaf
  readonly value: Accessor<unknown>
  readonly set: (next: unknown) => void
}

const other = (side: Side): Side => (side === 'start' ? 'end' : 'start')

function swap(ids: readonly string[], at: number, to: number): string[] {
  const next = [...ids]
  ;[next[at], next[to]] = [next[to]!, next[at]!]
  return next
}

export function LayoutControl({ leaf, value, set }: LayoutControlProps) {
  const t = LL().settings.widgets.layout
  const layouts = value as Accessor<Layouts>
  const outputs = app.get_monitors().map((it) => it.connector ?? '').filter(Boolean)

  const [target, setTarget] = createState(DEFAULT_LAYOUT)
  const custom = createComputed(() => target() !== DEFAULT_LAYOUT && target() in layouts())
  const current = createComputed(() => layouts()[target()] ?? layouts()[DEFAULT_LAYOUT]!)

  const write = (next: Layout) => set({ ...layouts(), [target()]: next })

  const inherit = () => {
    const { [target()]: _, ...rest } = layouts()
    set(rest)
  }

  const edit = (side: Side, change: (ids: readonly string[]) => readonly string[]) =>
    write({ ...current(), [side]: change(current()[side]) })

  const move = (side: Side, id: string) =>
    write({
      ...current(),
      [side]: current()[side].filter((it) => it !== id),
      [other(side)]: [...current()[other(side)], id],
    } as Layout)

  const unused = createComputed(() => leaf.items.filter((id) => !current().start.includes(id) && !current().end.includes(id)))

  const label = (id: string) => (t.items as unknown as Record<string, () => string>)[id]?.() ?? id

  const Column = ({ side }: { readonly side: Side }) => {
    const ids = current.as((it) => it[side])

    return (
      <box class={cs.column} orientation={Gtk.Orientation.VERTICAL} hexpand>
        <box class={cs.table} orientation={Gtk.Orientation.VERTICAL}>
          <box class={cs.head}>
            <label class={cs.col} label={side === 'start' ? t.start() : t.end()} xalign={0} />
          </box>
          <For each={ids}>
            {(id: string) => {
              const at = ids.as((it) => it.indexOf(id))

              return (
                <box class={cs.row}>
                  <label class={cs.name} label={label(id)} xalign={0} hexpand />
                  <button
                    class={cs.action}
                    tooltipText={t.up()}
                    focusable={false}
                    sensitive={at.as((it) => it > 0)}
                    onClicked={() => edit(side, (list) => swap(list, at(), at() - 1))}>
                    <image iconName={icons.up} />
                  </button>
                  <button
                    class={cs.action}
                    tooltipText={t.down()}
                    focusable={false}
                    sensitive={createComputed(() => at() < ids().length - 1)}
                    onClicked={() => edit(side, (list) => swap(list, at(), at() + 1))}>
                    <image iconName={icons.down} />
                  </button>
                  <button
                    class={cs.action}
                    tooltipText={side === 'start' ? t.toEnd() : t.toStart()}
                    focusable={false}
                    onClicked={() => move(side, id)}>
                    <image iconName={side === 'start' ? icons.toEnd : icons.toStart} />
                  </button>
                  <button
                    class={cs.action}
                    tooltipText={t.remove()}
                    focusable={false}
                    onClicked={() => edit(side, (list) => list.filter((it) => it !== id))}>
                    <image iconName={icons.drop} />
                  </button>
                </box>
              )
            }}
          </For>
          <label class={cs.empty} label={t.empty()} xalign={0} visible={ids.as((it) => it.length === 0)} />
        </box>
        <box class={cs.adds} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.START} visible={unused.as((it) => it.length > 0)}>
          <For each={unused}>
            {(id: string) => (
              <button class={cs.add} focusable={false} onClicked={() => edit(side, (list) => [...list, id])}>
                <box valign={Gtk.Align.CENTER}>
                  <image iconName={icons.add} />
                  <label label={label(id)} />
                </box>
              </button>
            )}
          </For>
        </box>
      </box>
    )
  }

  return (
    <box class={cs.root} orientation={Gtk.Orientation.VERTICAL} hexpand>
      <box class={cs.targets} visible={outputs.length > 0}>
        {[DEFAULT_LAYOUT, ...outputs].map((output) => (
          <button
            class={target.as((it) => clsx(cs.target, it === output && cs.on))}
            focusable={false}
            onClicked={() => setTarget(output)}>
            <label label={output === DEFAULT_LAYOUT ? t.allDisplays() : output} />
          </button>
        ))}
      </box>
      <box class={cs.status} visible={target.as((it) => it !== DEFAULT_LAYOUT)}>
        <label
          class={cs.note}
          label={custom.as((it) => (it ? t.custom() : t.inherited()))}
          xalign={0}
          hexpand
          wrap
        />
        <button class={cs.add} focusable={false} visible={custom} onClicked={inherit}>
          <box valign={Gtk.Align.CENTER}>
            <image iconName={icons.reset} />
            <label label={t.useDefault()} />
          </box>
        </button>
      </box>
      <box class={cs.columns} homogeneous>
        <Column side="start" />
        <Column side="end" />
      </box>
    </box>
  )
}
