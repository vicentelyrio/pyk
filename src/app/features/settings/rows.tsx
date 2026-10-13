import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import Pango from 'gi://Pango'
import { Gdk, Gtk } from 'ags/gtk4'
import { For, createComputed, createState, onCleanup, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { closePopover, Popover, Switch } from '@/ui/components'
import { config } from '@/infrastructure/config'
import { acceptsItem, collapseHome, expandHome, type ChoiceLeaf, type ListLeaf, type NumberLeaf, type PathLeaf, type TableLeaf } from '@/infrastructure/config/schema'
import { LL } from '@/infrastructure/i18n'
import { isRemote } from '@/infrastructure/wallpaper'

import { patchFor, same, valueAt, type SettingRow } from './catalog'
import { copyFor, sectionTitle } from './copy'

const cs = {
  row: 'set-row',
  head: 'set-head',
  meta: 'set-meta',
  crumb: 'set-crumb',
  labels: 'set-labels',
  label: 'set-label',
  restart: 'set-restart',
  hint: 'set-hint',
  error: 'set-error',
  control: 'set-control',
  reset: 'set-reset',
  below: 'set-below',

  value: 'set-value',
  slider: 'set-slider',
  entry: 'set-entry',
  input: 'set-input',
  unit: 'set-unit',
  segmented: 'set-segmented',
  option: 'set-option',
  dropdown: 'set-dropdown',
  menu: 'set-menu',
  menuItem: 'set-menu-item',
  check: 'set-check',
  swatches: 'set-swatches',
  swatch: 'set-swatch',
  colorField: 'set-color-field',
  colorChip: 'set-color-chip',
  text: 'set-text',
  path: 'set-path',
  browse: 'set-browse',
  chips: 'set-chips',
  chip: 'set-chip',
  chipLabel: 'set-chip-label',
  chipDrop: 'set-chip-drop',
  capture: 'set-capture',
  captureDot: 'set-capture-dot',
  captureHint: 'set-capture-hint',
  add: 'set-add',
  table: 'set-table',
  tableHead: 'set-table-head',
  tableCol: 'set-table-col',
  tableRow: 'set-table-row',
  tableKey: 'set-table-key',
  tableValue: 'set-table-value',
  tableClear: 'set-table-clear',
  empty: 'set-table-empty',

  on: '--on',
  failed: '--failed',
  advanced: '--advanced',
}

const icons = {
  reset: 'pyk-reset-symbolic',
  chevron: 'pyk-chevron-down-symbolic',
  check: 'pyk-check-symbolic',
  drop: 'pyk-x-symbolic',
  add: 'pyk-plus-symbolic',
}

const COMMIT_DELAY = 150

const NUMBER_CHARS = 7
const HEX_CHARS = 8
const TEXT_CHARS = 18

const SWATCHES = ['#c9a7f0', '#a7bff0', '#9ecfb0', '#e8a598', '#e8cf98'] as const

const HEX = /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i

const home = GLib.get_home_dir()

function debounce<T>(run: (value: T) => void): (value: T) => void {
  let pending = 0
  let latest: T

  onCleanup(() => {
    if (pending) GLib.source_remove(pending)
  })

  return (value: T) => {
    latest = value
    if (pending) GLib.source_remove(pending)

    pending = GLib.timeout_add(GLib.PRIORITY_DEFAULT, COMMIT_DELAY, () => {
      pending = 0
      run(latest)
      return GLib.SOURCE_REMOVE
    })
  }
}

const SCROLL_STEPS = 3

function passScrollToList(self: Gtk.Widget): void {
  const scroll = new Gtk.EventControllerScroll({
    flags: Gtk.EventControllerScrollFlags.VERTICAL,
    propagationPhase: Gtk.PropagationPhase.CAPTURE,
  })

  scroll.connect('scroll', (_controller, _dx, dy: number) => {
    const view = self.get_ancestor(Gtk.ScrolledWindow.$gtype) as Gtk.ScrolledWindow | null
    const adjustment = view?.get_vadjustment()

    if (adjustment) {
      adjustment.set_value(adjustment.get_value() + dy * adjustment.get_step_increment() * SCROLL_STEPS)
    }

    return true
  })

  self.add_controller(scroll)
}

function bindText(self: Gtk.Entry, value: Accessor<unknown>): void {
  const editing = () => self.has_focus || self.get_focus_child() !== null
  const sync = () => {
    const next = String(value())
    if (self.text !== next) self.text = next
  }

  const focus = new Gtk.EventControllerFocus()
  focus.connect('leave', sync)
  self.add_controller(focus)

  sync()
  onCleanup(value.subscribe(() => {
    if (!editing()) sync()
  }))
}

function stepOf(leaf: NumberLeaf): number {
  return leaf.step ?? (leaf.max - leaf.min <= 2 ? 0.01 : 1)
}

function decimalsOf(step: number): number {
  return String(step).split('.')[1]?.length ?? 0
}

function snap(leaf: NumberLeaf, value: number): number {
  const step = stepOf(leaf)
  const snapped = Number((Math.round(value / step) * step).toFixed(decimalsOf(step)))

  return Math.min(leaf.max, Math.max(leaf.min, snapped))
}

function display(leaf: NumberLeaf, value: number): string {
  const decimals = decimalsOf(stepOf(leaf))
  const text = decimals ? String(Number(value.toFixed(decimals))) : String(Math.round(value))

  return leaf.unit ? `${text} ${leaf.unit}` : text
}

export type RowProps = {
  readonly row: SettingRow
  readonly crumb: boolean
  readonly capturing: Accessor<string | null>
  readonly onCapture: (key: string | null) => void
}

export function SettingRowView({ row, crumb, capturing, onCapture }: RowProps) {
  const t = LL().settings
  const text = copyFor(row.path)
  const { leaf } = row

  const value = createComputed(() => valueAt(config.state(), row.path))
  const modified = createComputed(() => !same(value(), leaf.default))

  const set = (next: unknown) => config.write(patchFor(row.path, next))
  const reset = () => config.write(patchFor(row.path, leaf.default))

  const [error, setError] = createState('')

  const inline = leaf.kind !== 'path' && leaf.kind !== 'shortcut' && leaf.kind !== 'record' && leaf.kind !== 'list' && leaf.kind !== 'table'

  return (
    <box class={cs.row} orientation={Gtk.Orientation.VERTICAL}>
      <box class={cs.head}>
        <box class={cs.labels} orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label
            class={cs.crumb}
            label={sectionTitle(row.section).toUpperCase()}
            xalign={0}
            maxWidthChars={1}
            ellipsize={Pango.EllipsizeMode.END}
            visible={crumb}
          />
          <box class={cs.meta}>
            <label
              class={clsx(cs.label, row.section === 'advanced' && cs.advanced)}
              label={text.label}
              xalign={0}
              wrap
            />
            <label class={cs.restart} label={t.afterRestart()} visible={leaf.apply === 'restart'} />
          </box>
          <label
            class={cs.hint}
            label={text.hint}
            xalign={0}
            wrap
            wrapMode={Pango.WrapMode.WORD_CHAR}
            maxWidthChars={1}
          />
          <label
            class={cs.error}
            label={error}
            xalign={0}
            wrap
            maxWidthChars={1}
            visible={error.as(Boolean)}
          />
        </box>

        {inline
          ? (
            <box class={cs.control} halign={Gtk.Align.END} valign={Gtk.Align.START}>
              <ResetButton visible={modified} onReset={reset} />
              <Control row={row} value={value} set={set} onError={setError} />
            </box>
          )
          : <box hexpand />}
      </box>

      {inline
        ? <box visible={false} />
        : (
          <box class={cs.below}>
            <Control
              row={row}
              value={value}
              set={set}
              onError={setError}
              capturing={capturing}
              onCapture={onCapture}
            />
            <ResetButton visible={modified} onReset={reset} />
          </box>
        )}
    </box>
  )
}

function ResetButton({ visible, onReset }: { readonly visible: Accessor<boolean>, readonly onReset: () => void }) {
  const t = LL().settings

  return (
    <button
      class={cs.reset}
      tooltipText={t.resetRow()}
      focusable={false}
      valign={Gtk.Align.START}
      visible={visible}
      onClicked={onReset}>
      <image iconName={icons.reset} />
    </button>
  )
}

type ControlProps = {
  readonly row: SettingRow
  readonly value: Accessor<unknown>
  readonly set: (next: unknown) => void
  readonly onError: (message: string) => void
  readonly capturing?: Accessor<string | null>
  readonly onCapture?: (key: string | null) => void
}

function Control(props: ControlProps) {
  const { leaf } = props.row

  switch (leaf.kind) {
    case 'toggle':
      return <ToggleControl {...props} />
    case 'number':
      return leaf.unit === 'ms' ? <EntryControl {...props} /> : <SliderControl {...props} />
    case 'choice':
      return leaf.options.length > 3 ? <DropdownControl {...props} /> : <SegmentedControl {...props} />
    case 'color':
      return <ColorControl {...props} />
    case 'text':
      return <TextControl {...props} />
    case 'path':
      return <PathControl {...props} />
    case 'shortcut':
      return <ShortcutControl {...props} />
    case 'record':
      return <RecordControl {...props} />
    case 'list':
      return <ListControl {...props} />
    case 'table':
      return <TableControl {...props} />
  }
}

function ToggleControl({ value, set }: ControlProps) {
  const on = value.as(Boolean)

  return <Switch on={on} onToggle={() => set(!on())} />
}

function whileDragging(self: Gtk.Widget, onStart: () => void, onEnd: () => void): void {
  const events = new Gtk.EventControllerLegacy({ propagationPhase: Gtk.PropagationPhase.CAPTURE })

  events.connect('event', (_controller, event: Gdk.Event) => {
    const type = event.get_event_type()

    if (type === Gdk.EventType.BUTTON_PRESS) onStart()
    if (type === Gdk.EventType.BUTTON_RELEASE) onEnd()

    return false
  })

  self.add_controller(events)
}

function SliderControl({ row, value, set }: ControlProps) {
  const leaf = row.leaf as NumberLeaf
  const [draft, setDraft] = createState(value() as number)

  onCleanup(value.subscribe(() => setDraft(value() as number)))

  const commit = debounce<number>((next) => set(next))
  let dragging = false

  return (
    <box class={cs.slider} valign={Gtk.Align.CENTER}>
      <slider
        min={leaf.min}
        max={leaf.max}
        step={stepOf(leaf)}
        value={draft}
        $={(self) => {
          passScrollToList(self as Gtk.Widget)
          whileDragging(
            self as Gtk.Widget,
            () => { dragging = true },
            () => {
              dragging = false
              set(draft())
            },
          )
        }}
        onChangeValue={(self: Gtk.Range) => {
          const next = snap(leaf, self.get_value())
          setDraft(next)
          if (!dragging) commit(next)
        }}
      />
      <label class={cs.value} label={draft.as((it) => display(leaf, it))} xalign={1} />
    </box>
  )
}

function EntryControl({ row, value, set, onError }: ControlProps) {
  const t = LL().settings
  const leaf = row.leaf as NumberLeaf

  const [bad, setBad] = createState(false)
  const commit = debounce<number>((next) => set(next))

  return (
    <box class={bad.as((it) => clsx(cs.entry, it && cs.failed))} valign={Gtk.Align.CENTER}>
      <entry
        class={cs.input}
        $={(self: Gtk.Entry) => bindText(self, value)}
        xalign={1}
        widthChars={NUMBER_CHARS}
        maxWidthChars={NUMBER_CHARS}
        onNotifyText={(self: Gtk.Entry) => {
          const raw = self.text
          const next = Number(raw)
          const invalid = raw.trim() === '' || !Number.isFinite(next) || next < leaf.min || next > leaf.max

          setBad(invalid)
          onError(invalid
            ? t.outOfRange({ raw, min: String(leaf.min), max: String(leaf.max) })
            : '')

          if (!invalid) commit(next)
        }}
      />
      <label class={cs.unit} label={leaf.unit ?? ''} visible={Boolean(leaf.unit)} />
    </box>
  )
}

function SegmentedControl({ row, value, set }: ControlProps) {
  const leaf = row.leaf as ChoiceLeaf<string>

  return (
    <box class={cs.segmented} valign={Gtk.Align.CENTER}>
      {leaf.options.map((option) => (
        <button
          class={value.as((it) => clsx(cs.option, it === option && cs.on))}
          focusable={false}
          onClicked={() => set(option)}>
          <label label={option} />
        </button>
      ))}
    </box>
  )
}

function DropdownControl({ row, value, set }: ControlProps) {
  const leaf = row.leaf as ChoiceLeaf<string>

  const trigger = (
    <box class={cs.dropdown} valign={Gtk.Align.CENTER}>
      <label label={value.as(String)} xalign={0} hexpand />
      <image iconName={icons.chevron} />
    </box>
  )

  return (
    <Popover contentClassName={cs.menu} trigger={trigger} halign={Gtk.Align.END}>
      <box orientation={Gtk.Orientation.VERTICAL}>
        {leaf.options.map((option) => (
          <button
            class={cs.menuItem}
            focusable={false}
            onClicked={(self: Gtk.Button) => closePopover(self, () => set(option))}>
            <box>
              <label label={option} xalign={0} hexpand />
              <image
                class={cs.check}
                iconName={icons.check}
                visible={value.as((it) => it === option)}
              />
            </box>
          </button>
        ))}
      </box>
    </Popover>
  )
}

function ColorControl({ value, set, onError }: ControlProps) {
  const [bad, setBad] = createState(false)
  const commit = debounce<string>((next) => set(next))

  return (
    <box class={cs.swatches} valign={Gtk.Align.CENTER}>
      {SWATCHES.map((hex) => (
        <button
          class={value.as((it) => clsx(cs.swatch, it === hex && cs.on))}
          css={`background-color: ${hex};`}
          tooltipText={hex}
          focusable={false}
          valign={Gtk.Align.CENTER}
          onClicked={() => set(hex)}
        />
      ))}
      <box class={bad.as((it) => clsx(cs.colorField, it && cs.failed))} valign={Gtk.Align.CENTER}>
        <box class={cs.colorChip} valign={Gtk.Align.CENTER} css={value.as((it) => `background-color: ${String(it)};`)} />
        <entry
          class={cs.input}
          $={(self: Gtk.Entry) => bindText(self, value)}
          widthChars={HEX_CHARS}
          maxWidthChars={HEX_CHARS}
          onNotifyText={(self: Gtk.Entry) => {
            const raw = self.text
            const invalid = !HEX.test(raw)

            setBad(invalid)
            onError(invalid && raw.trim() !== '' ? `${raw} is not a hex color` : '')

            if (!invalid) commit(raw)
          }}
        />
      </box>
    </box>
  )
}

function TextControl({ value, set, onError }: ControlProps) {
  const [bad, setBad] = createState(false)
  const commit = debounce<string>((next) => set(next))

  return (
    <box class={bad.as((it) => clsx(cs.text, it && cs.failed))} valign={Gtk.Align.CENTER}>
      <entry
        class={cs.input}
        $={(self: Gtk.Entry) => bindText(self, value)}
        widthChars={TEXT_CHARS}
        maxWidthChars={TEXT_CHARS}
        onNotifyText={(self: Gtk.Entry) => {
          const raw = self.text
          const invalid = raw.trim() === ''

          setBad(invalid)
          onError(invalid ? 'Cannot be empty' : '')

          if (!invalid) commit(raw)
        }}
      />
    </box>
  )
}

function PathControl({ row, value, set }: ControlProps) {
  const t = LL().settings
  const leaf = row.leaf as PathLeaf

  const commit = debounce<string>((next) => set(next))

  const browse = (self: Gtk.Widget) => {
    const dialog = new Gtk.FileDialog({ modal: true })
    const window = self.get_root() as Gtk.Window | null
    const current = expandHome(String(value()), home)

    if (current && !isRemote(current)) dialog.set_initial_file(Gio.File.new_for_path(current))

    const picked = leaf.select === 'directory'
      ? dialog.select_folder(window, null)
      : dialog.open(window, null)

    picked
      .then((file) => {
        const path = file.get_path()
        if (path) set(collapseHome(path, home))
      })
      .catch(() => {})
  }

  return (
    <box class={cs.path} hexpand valign={Gtk.Align.CENTER}>
      <entry
        class={cs.input}
        $={(self: Gtk.Entry) => bindText(self, value)}
        hexpand
        onNotifyText={(self: Gtk.Entry) => commit(self.text)}
      />
      <button class={cs.browse} focusable={false} onClicked={(self: Gtk.Button) => browse(self)}>
        <label label={t.browse()} />
      </button>
    </box>
  )
}

function ShortcutControl({ row, value, set, capturing, onCapture }: ControlProps) {
  const t = LL().settings

  const keys = value as Accessor<readonly string[]>
  const armed = capturing?.as((it) => it === row.key) ?? createComputed(() => false)

  return (
    <box class={cs.chips} hexpand valign={Gtk.Align.CENTER}>
      <For each={keys} id={(it: string) => it}>
        {(combo: string) => (
          <box class={cs.chip} valign={Gtk.Align.CENTER}>
            <label class={cs.chipLabel} label={combo} />
            <button
              class={cs.chipDrop}
              tooltipText={t.removeShortcut()}
              focusable={false}
              onClicked={() => set(keys().filter((it) => it !== combo))}>
              <image iconName={icons.drop} />
            </button>
          </box>
        )}
      </For>

      <box class={cs.capture} valign={Gtk.Align.CENTER} visible={armed}>
        <box class={cs.captureDot} valign={Gtk.Align.CENTER} />
        <label label={t.capturing()} />
        <label class={cs.captureHint} label={t.captureHint()} />
      </box>

      <button
        class={cs.add}
        focusable={false}
        visible={armed.as((it) => !it)}
        onClicked={() => onCapture?.(row.key)}>
        <box valign={Gtk.Align.CENTER}>
          <image iconName={icons.add} />
          <label label={t.addShortcut()} />
        </box>
      </button>
    </box>
  )
}

function ListControl({ row, value, set, onError }: ControlProps) {
  const t = LL().settings
  const leaf = row.leaf as ListLeaf

  const items = value as Accessor<readonly string[]>

  const add = (self: Gtk.Entry) => {
    const item = self.text.trim()
    if (!item) return

    if (!acceptsItem(leaf, item)) {
      onError(t.listInvalid({ raw: item }))
      return
    }

    onError('')
    if (!items().includes(item)) set([...items(), item])
    self.text = ''
  }

  let input: Gtk.Entry | null = null

  return (
    <box class={cs.table} orientation={Gtk.Orientation.VERTICAL} hexpand>
      <For each={items} id={(it: string) => it}>
        {(item: string) => (
          <box class={cs.tableRow}>
            <label
              class={cs.tableValue}
              label={item}
              xalign={0}
              hexpand
              maxWidthChars={1}
              ellipsize={Pango.EllipsizeMode.MIDDLE}
            />
            <button
              class={cs.tableClear}
              tooltipText={t.removeShortcut()}
              focusable={false}
              onClicked={() => set(items().filter((it) => it !== item))}>
              <image iconName={icons.drop} />
            </button>
          </box>
        )}
      </For>
      <label
        class={cs.empty}
        label={t.listEmpty()}
        xalign={0}
        visible={items.as((it) => it.length === 0)}
      />
      <box class={cs.path} hexpand>
        <entry
          class={cs.input}
          placeholderText={t.listPlaceholder()}
          hexpand
          $={(self: Gtk.Entry) => (input = self)}
          onActivate={add}
        />
        <button class={cs.browse} focusable={false} onClicked={() => input && add(input)}>
          <label label={t.listAdd()} />
        </button>
      </box>
    </box>
  )
}

function TableControl({ row, value, set }: ControlProps) {
  const t = LL().settings
  const leaf = row.leaf as TableLeaf

  const rows = value as Accessor<readonly Readonly<Record<string, string>>[]>

  return (
    <box class={cs.table} orientation={Gtk.Orientation.VERTICAL} hexpand>
      <box class={cs.tableHead}>
        {leaf.columns.map((column) => (
          <label class={cs.tableCol} label={column.toUpperCase()} xalign={0} hexpand />
        ))}
      </box>
      <For each={rows} id={(it: Readonly<Record<string, string>>) => JSON.stringify(it)}>
        {(entry: Readonly<Record<string, string>>) => (
          <box class={cs.tableRow}>
            {leaf.columns.map((column) => (
              <label
                class={cs.tableValue}
                label={entry[column] ?? ''}
                tooltipText={entry[column] ?? ''}
                xalign={0}
                hexpand
                maxWidthChars={1}
                ellipsize={Pango.EllipsizeMode.MIDDLE}
              />
            ))}
            <button
              class={cs.tableClear}
              tooltipText={t.removeShortcut()}
              focusable={false}
              onClicked={() => set(rows().filter((it) => it !== entry))}>
              <image iconName={icons.drop} />
            </button>
          </box>
        )}
      </For>
      <label
        class={cs.empty}
        label={t.listEmpty()}
        xalign={0}
        visible={rows.as((it) => it.length === 0)}
      />
    </box>
  )
}

function RecordControl({ value, set }: ControlProps) {
  const t = LL().settings

  const entries = createComputed(() => Object.entries(value() as Record<string, string>))

  return (
    <box class={cs.table} orientation={Gtk.Orientation.VERTICAL} hexpand>
      <box class={cs.tableHead}>
        <label class={cs.tableCol} label={t.recordKey()} xalign={0} />
        <label class={cs.tableCol} label={t.recordValue()} xalign={0} hexpand />
      </box>
      <For each={entries} id={(it: readonly [string, string]) => it[0]}>
        {(entry: readonly [string, string]) => (
          <box class={cs.tableRow}>
            <label class={cs.tableKey} label={entry[0]} xalign={0} />
            <label
              class={cs.tableValue}
              label={entry[1]}
              xalign={0}
              hexpand
              maxWidthChars={1}
              ellipsize={Pango.EllipsizeMode.START}
            />
            <button
              class={cs.tableClear}
              tooltipText={t.clearRecord()}
              focusable={false}
              onClicked={() => {
                const next = { ...(value() as Record<string, string>) }
                delete next[entry[0]]
                set(next)
              }}>
              <image iconName={icons.drop} />
            </button>
          </box>
        )}
      </For>
      <label
        class={cs.empty}
        label={t.recordEmpty()}
        xalign={0}
        visible={entries.as((it) => it.length === 0)}
      />
    </box>
  )
}
