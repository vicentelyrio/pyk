import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For, createComputed, createState, onCleanup, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { AppIcon } from '@/ui/components'
import { apps, type AppEntry } from '@/infrastructure/apps'
import { config, type ShortcutsConfig } from '@/infrastructure/config'
import { handleShortcut, type ShortcutHandlers } from '@/infrastructure/shortcuts'

import { launcher } from './state'

const cs = {
  root: 'launcher',
  search: 'launcher-search',
  searchIcon: 'launcher-search-icon',
  input: 'launcher-input',
  count: 'launcher-count',
  results: 'launcher-results',
  row: 'launcher-row',
  name: 'launcher-name',
  kind: 'launcher-kind',
  empty: 'launcher-empty',

  selected: '--selected',
}

const icons = {
  search: 'pyk-search-symbolic',
}

export function Launcher() {
  const [query, setQuery] = createState('')
  const [cursor, setCursor] = createState(0)

  const results = createComputed(() => apps.search(apps.apps(), query(), config.launcher().resultLimit))
  const selected = createComputed(() => Math.min(cursor(), results().length - 1))

  const move = (step: number) => {
    const count = results().length
    if (count > 0) setCursor((selected() + step + count) % count)
  }

  const launch = (entry: AppEntry | undefined) => {
    if (!entry) return
    apps.launch(entry.id)
    if (config.launcher().closeOnLaunch) launcher.hide()
    else reset()
  }

  let input: Gtk.Entry | null = null

  const reset = () => {
    input?.set_text('')
    setQuery('')
    setCursor(0)
  }

  const actions: ShortcutHandlers<keyof ShortcutsConfig['launcher']> = {
    close: () => launcher.hide(),
    next: () => move(1),
    previous: () => move(-1),
    launch: () => launch(results()[selected()]),
  }

  const attach = (self: Gtk.Widget) => {
    const keys = new Gtk.EventControllerKey({ propagationPhase: Gtk.PropagationPhase.CAPTURE })

    keys.connect('key-pressed', (_controller, keyval, _keycode, state) =>
      handleShortcut(config.shortcuts().launcher, actions, keyval, state))

    self.add_controller(keys)

    const dispose = launcher.open.subscribe(() => {
      if (!launcher.open()) return
      apps.reload()
      reset()
      input?.grab_focus()
    })

    onCleanup(dispose)
  }

  return (
    <box
      class={cs.root}
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      overflow={Gtk.Overflow.HIDDEN}
      $={attach}>
      <box class={cs.search} valign={Gtk.Align.CENTER}>
        <image class={cs.searchIcon} iconName={icons.search} />
        <entry
          class={cs.input}
          placeholderText="Search apps…"
          hexpand
          $={(self) => {
            input = self as Gtk.Entry
          }}
          onNotifyText={(self: Gtk.Entry) => {
            setQuery(self.text)
            setCursor(0)
          }}
        />
        <label class={cs.count} label={createComputed(() => `${results().length}/${apps.count()}`)} />
      </box>
      <box class={cs.results} orientation={Gtk.Orientation.VERTICAL}>
        <For each={results} id={(it: AppEntry) => it.id}>
          {(it: AppEntry, index: Accessor<number>) => (
            <LauncherRow
              app={it}
              selected={createComputed(() => index() === selected())}
              onLaunch={() => launch(it)}
            />
          )}
        </For>
        <label
          class={cs.empty}
          label="No matches"
          visible={results.as((it) => it.length === 0)}
        />
      </box>
    </box>
  )
}

type LauncherRowProps = {
  readonly app: AppEntry
  readonly selected: Accessor<boolean>
  readonly onLaunch: () => void
}

function LauncherRow({ app, selected, onLaunch }: LauncherRowProps) {
  return (
    <button
      class={selected.as((it) => clsx(cs.row, it && cs.selected))}
      tooltipText={app.description || app.name}
      focusable={false}
      onClicked={onLaunch}>
      <box valign={Gtk.Align.CENTER}>
        <AppIcon icon={app.iconName} />
        <label
          class={cs.name}
          label={app.name}
          xalign={0}
          ellipsize={Pango.EllipsizeMode.END}
          maxWidthChars={1}
          hexpand
        />
        <label class={cs.kind} label={apps.kind(app)} />
      </box>
    </button>
  )
}
