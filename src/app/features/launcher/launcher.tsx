import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import { Gdk, Gtk } from 'ags/gtk4'
import { For, createComputed, createState, onCleanup, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { AppIcon } from '@/ui/components'
import { apps, type AppEntry } from '@/infrastructure/apps'
import { collapseHome, config, type ShortcutsConfig } from '@/infrastructure/config'
import { files, type FileHit } from '@/infrastructure/files'
import { handleShortcut, type ShortcutHandlers } from '@/infrastructure/shortcuts'

import { evaluate, formatResult } from './calc'

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
  calc: 'pyk-calculator-symbolic',
}

const FILE_DEBOUNCE = 120
const KIND_WIDTH = 28

const home = GLib.get_home_dir()

export interface LauncherAction {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly keywords: readonly string[]
  readonly iconName: string
  readonly kind: string
  readonly run: () => void
}

type LauncherItem = AppEntry | LauncherAction

export type LauncherProps = {
  readonly open: Accessor<boolean>
  readonly actions: readonly LauncherAction[]
  readonly onClose: () => void
}

function isAction(item: LauncherItem): item is LauncherAction {
  return 'run' in item
}

function copy(text: string): void {
  Gdk.Display.get_default()?.get_clipboard().set(text)
}

function calcAction(result: string): LauncherAction {
  return {
    id: `calc:${result}`,
    name: `= ${result}`,
    description: 'Copy result to clipboard',
    keywords: [],
    iconName: icons.calc,
    kind: 'calc',
    run: () => copy(result),
  }
}

function fileAction(hit: FileHit): LauncherAction {
  return {
    id: `file:${hit.path}`,
    name: hit.name,
    description: collapseHome(hit.path, home),
    keywords: [],
    iconName: hit.iconName,
    kind: collapseHome(hit.parent, home),
    run: () => files.open(hit.path),
  }
}

function fileNeedle(query: string): string | null {
  return query.startsWith(' ') ? query.trim() : null
}

export function Launcher({ open, actions, onClose }: LauncherProps) {
  const [query, setQuery] = createState('')
  const [cursor, setCursor] = createState(0)
  const [fileHits, setFileHits] = createState<readonly LauncherItem[]>([])
  const [searching, setSearching] = createState(false)

  const fileMode = query.as((it) => fileNeedle(it) !== null)

  const results = createComputed((): readonly LauncherItem[] => {
    if (fileMode()) return fileHits()

    const limit = config.launcher().resultLimit
    const needle = query()
    const matches = needle.trim()
      ? apps.search<LauncherItem>([...apps.apps(), ...actions], needle, limit)
      : apps.search(apps.apps(), needle, limit)
    const value = evaluate(needle)

    return value === null ? matches : [calcAction(formatResult(value)), ...matches].slice(0, limit)
  })
  const selected = createComputed(() => Math.min(cursor(), results().length - 1))

  const move = (step: number) => {
    const count = results().length
    if (count > 0) setCursor((selected() + step + count) % count)
  }

  const launch = (entry: LauncherItem | undefined) => {
    if (!entry) return

    if (isAction(entry)) {
      entry.run()
      onClose()
      return
    }

    apps.launch(entry.id)
    if (config.launcher().closeOnLaunch) onClose()
    else reset()
  }

  let input: Gtk.Entry | null = null

  const reset = () => {
    input?.set_text('')
    setQuery('')
    setCursor(0)
  }

  let generation = 0
  let debounce = 0

  const searchFiles = () => {
    const needle = fileNeedle(query())
    const current = ++generation

    if (debounce) GLib.source_remove(debounce)
    debounce = 0

    if (!needle) {
      setFileHits([])
      setSearching(false)
      return
    }

    setSearching(true)
    debounce = GLib.timeout_add(GLib.PRIORITY_DEFAULT, FILE_DEBOUNCE, () => {
      debounce = 0
      files.search(needle, config.launcher().resultLimit).then((hits) => {
        if (current !== generation) return
        setFileHits(hits.map(fileAction))
        setSearching(false)
      })
      return GLib.SOURCE_REMOVE
    })
  }

  const keymap: ShortcutHandlers<keyof ShortcutsConfig['launcher']> = {
    close: onClose,
    next: () => move(1),
    previous: () => move(-1),
    launch: () => launch(results()[selected()]),
  }

  const attach = (self: Gtk.Widget) => {
    const keys = new Gtk.EventControllerKey({ propagationPhase: Gtk.PropagationPhase.CAPTURE })

    keys.connect('key-pressed', (_controller, keyval, _keycode, state) =>
      handleShortcut(config.shortcuts().launcher, keymap, keyval, state))

    self.add_controller(keys)

    const dispose = open.subscribe(() => {
      if (!open()) return
      apps.reload()
      reset()
      input?.grab_focus()
    })

    onCleanup(dispose)
    onCleanup(query.subscribe(searchFiles))
    onCleanup(() => {
      generation++
      if (debounce) GLib.source_remove(debounce)
    })
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
          placeholderText="Search apps, settings or calculate — space for files…"
          hexpand
          $={(self) => {
            input = self as Gtk.Entry
          }}
          onNotifyText={(self: Gtk.Entry) => {
            setQuery(self.text)
            setCursor(0)
          }}
        />
        <label
          class={cs.count}
          label={createComputed(() =>
            (fileMode() ? `${results().length} files` : `${results().length}/${apps.count() + actions.length}`))}
        />
      </box>
      <box class={cs.results} orientation={Gtk.Orientation.VERTICAL}>
        <For each={results} id={(it: LauncherItem) => it.id}>
          {(it: LauncherItem, index: Accessor<number>) => (
            <LauncherRow
              item={it}
              selected={createComputed(() => index() === selected())}
              onLaunch={() => launch(it)}
            />
          )}
        </For>
        <label
          class={cs.empty}
          label={createComputed(() => {
            if (!fileMode()) return 'No matches'
            if (!fileNeedle(query())) return 'Type to search files'
            return searching() ? 'Searching…' : 'No files found'
          })}
          visible={results.as((it) => it.length === 0)}
        />
      </box>
    </box>
  )
}

type LauncherRowProps = {
  readonly item: LauncherItem
  readonly selected: Accessor<boolean>
  readonly onLaunch: () => void
}

function LauncherRow({ item, selected, onLaunch }: LauncherRowProps) {
  return (
    <button
      class={selected.as((it) => clsx(cs.row, it && cs.selected))}
      tooltipText={item.description || item.name}
      focusable={false}
      onClicked={onLaunch}>
      <box valign={Gtk.Align.CENTER}>
        <AppIcon icon={item.iconName} />
        <label
          class={cs.name}
          label={item.name}
          xalign={0}
          ellipsize={Pango.EllipsizeMode.END}
          maxWidthChars={1}
          hexpand
        />
        <label
          class={cs.kind}
          label={isAction(item) ? item.kind : apps.kind(item)}
          ellipsize={Pango.EllipsizeMode.START}
          maxWidthChars={KIND_WIDTH}
        />
      </box>
    </button>
  )
}
