import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import { Gdk, Gtk } from 'ags/gtk4'
import { For, createComputed, createState, onCleanup, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { config } from '@/infrastructure/config'
import { LL } from '@/infrastructure/i18n'
import { toShortcut } from '@/infrastructure/shortcuts'

import { collapseHome } from '@/infrastructure/config/schema'

import { patchFor, ROWS, same, SECTION_ICONS, SECTIONS, valueAt, type SectionId, type SettingRow } from './catalog'
import { copyFor, sectionTitle } from './copy'
import { DensityRow } from './density'
import { SettingRowView } from './rows'

const cs = {
  root: 'settings',
  sidebar: 'settings-sidebar',
  brand: 'settings-brand',
  search: 'settings-search',
  searchIcon: 'settings-search-icon',
  searchInput: 'settings-search-input',
  clear: 'settings-clear',
  nav: 'settings-nav',
  navItem: 'settings-nav-item',
  navIcon: 'settings-nav-icon',
  navLabel: 'settings-nav-label',
  navDot: 'settings-nav-dot',
  footer: 'settings-footer',
  path: 'settings-path',
  resetAll: 'settings-reset-all',
  content: 'settings-content',
  header: 'settings-header',
  heading: 'settings-heading',
  headingMeta: 'settings-heading-meta',
  banner: 'settings-banner',
  bannerText: 'settings-banner-text',
  note: 'settings-note',
  rows: 'settings-rows',
  list: 'settings-list',
  empty: 'settings-empty',
  emptyTitle: 'settings-empty-title',
  emptyHint: 'settings-empty-hint',
  close: 'settings-close',

  active: '--active',
  armed: '--armed',
}

const icons = {
  search: 'pyk-search-symbolic',
  clear: 'pyk-x-symbolic',
  reset: 'pyk-reset-symbolic',
  close: 'pyk-x-symbolic',
}

function matches(row: SettingRow, needle: string): boolean {
  const { label, hint } = copyFor(row.path)
  const haystack = `${label} ${hint} ${sectionTitle(row.section)} ${row.key}`

  return haystack.toLowerCase().includes(needle)
}

export type SettingsProps = {
  readonly section: Accessor<SectionId>
  readonly onSection: (id: SectionId) => void
  readonly onClose: () => void
}

export function Settings({ section, onSection, onClose }: SettingsProps) {
  const t = LL().settings

  const [query, setQuery] = createState('')
  const [armed, setArmed] = createState(false)
  const [capturing, setCapturing] = createState<string | null>(null)

  const searching = query.as((it) => it.trim().length > 0)

  const visible = createComputed(() => {
    const needle = query().trim().toLowerCase()

    return needle ? ROWS.filter((row) => matches(row, needle)) : ROWS.filter((row) => row.section === section())
  })

  const pending = createComputed(() =>
    ROWS.filter((row) => row.leaf.apply === 'restart' && !same(valueAt(config.state(), row.path), row.leaf.default)))

  const capture = (self: Gtk.Widget) => {
    const keys = new Gtk.EventControllerKey({ propagationPhase: Gtk.PropagationPhase.CAPTURE })

    keys.connect('key-pressed', (_controller, keyval, _keycode, state: Gdk.ModifierType) => {
      const key = capturing()

      if (!key) {
        if (keyval === Gdk.KEY_Escape) {
          onClose()
          return true
        }
        return false
      }

      if (keyval === Gdk.KEY_Escape) {
        setCapturing(null)
        return true
      }

      const combo = toShortcut(keyval, state)
      if (!combo) return true

      const row = ROWS.find((it) => it.key === key)

      if (row) {
        const current = valueAt(config.state(), row.path) as readonly string[]
        if (!current.includes(combo)) config.write(patchFor(row.path, [...current, combo]))
      }

      setCapturing(null)
      return true
    })

    self.add_controller(keys)
  }

  let input: Gtk.Entry | null = null

  const clearSearch = () => {
    input?.set_text('')
    setQuery('')
  }

  const attach = (self: Gtk.Widget) => {
    capture(self)
    onCleanup(section.subscribe(clearSearch))
  }

  return (
    <overlay halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
      <box class={cs.root} overflow={Gtk.Overflow.HIDDEN} $={attach}>
        <box class={cs.sidebar} orientation={Gtk.Orientation.VERTICAL} hexpand={false}>
          <box class={cs.brand} orientation={Gtk.Orientation.VERTICAL}>
            <label label={t.title()} xalign={0} />
            <box class={cs.search} valign={Gtk.Align.CENTER}>
              <image class={cs.searchIcon} iconName={icons.search} />
              <entry
                class={cs.searchInput}
                placeholderText={t.search()}
                hexpand
                $={(self) => {
                  input = self as Gtk.Entry
                }}
                onNotifyText={(self: Gtk.Entry) => setQuery(self.text)}
              />
              <button
                class={cs.clear}
                focusable={false}
                visible={searching}
                onClicked={clearSearch}>
                <image iconName={icons.clear} />
              </button>
            </box>
          </box>

          <scrolledwindow class={cs.nav} hscrollbarPolicy={Gtk.PolicyType.NEVER} vexpand>
            <box orientation={Gtk.Orientation.VERTICAL}>
              {SECTIONS.map((id) => (
                <button
                  class={createComputed(() => clsx(cs.navItem, !searching() && section() === id && cs.active))}
                  focusable={false}
                  onClicked={() => {
                    clearSearch()
                    onSection(id)
                  }}>
                  <box valign={Gtk.Align.CENTER}>
                    <image class={cs.navIcon} iconName={SECTION_ICONS[id]} />
                    <label
                      class={cs.navLabel}
                      label={sectionTitle(id)}
                      xalign={0}
                      hexpand
                      maxWidthChars={1}
                      ellipsize={Pango.EllipsizeMode.END}
                    />
                    <box
                      class={cs.navDot}
                      valign={Gtk.Align.CENTER}
                      visible={pending.as((rows) => rows.some((row) => row.section === id))}
                    />
                  </box>
                </button>
              ))}
            </box>
          </scrolledwindow>

          <box class={cs.footer} orientation={Gtk.Orientation.VERTICAL}>
            <label
              class={cs.path}
              label={collapseHome(config.path, GLib.get_home_dir())}
              xalign={0}
              maxWidthChars={1}
              ellipsize={Pango.EllipsizeMode.START}
            />
            <button
              class={armed.as((it) => clsx(cs.resetAll, it && cs.armed))}
              focusable={false}
              onClicked={() => {
                if (!armed()) {
                  setArmed(true)
                  return
                }
                setArmed(false)
                config.reset()
              }}>
              <box valign={Gtk.Align.CENTER}>
                <image iconName={icons.reset} />
                <label label={armed.as((it) => (it ? t.resetAllArmed() : t.resetAll()))} xalign={0} />
              </box>
            </button>
          </box>
        </box>

        <box class={cs.content} orientation={Gtk.Orientation.VERTICAL} hexpand>
          <box class={cs.header} orientation={Gtk.Orientation.VERTICAL}>
            <box>
              <label
                class={cs.heading}
                label={createComputed(() =>
                  (searching() ? t.resultsFor({ query: query().trim() }) : sectionTitle(section())))}
                xalign={0}
                hexpand
              />
              <label
                class={cs.headingMeta}
                label={createComputed(() =>
                  (searching()
                    ? t.matchCount({ shown: visible().length, total: ROWS.length })
                    : t.settingCount({ count: visible().length })))}
              />
            </box>

            <box class={cs.banner} valign={Gtk.Align.CENTER} visible={pending.as((it) => it.length > 0)}>
              <label
                class={cs.bannerText}
                label={pending.as((it) => (it.length === 1 ? t.restartOne() : t.restartMany({ count: it.length })))}
                xalign={0}
                hexpand
                wrap
                maxWidthChars={1}
              />
            </box>
          </box>

          <scrolledwindow class={cs.list} hscrollbarPolicy={Gtk.PolicyType.NEVER} vexpand>
            <box class={cs.rows} orientation={Gtk.Orientation.VERTICAL}>
              <label
                class={cs.note}
                label={t.advancedNote()}
                xalign={0}
                wrap
                maxWidthChars={1}
                visible={createComputed(() => !searching() && section() === 'advanced')}
              />
              <box
                orientation={Gtk.Orientation.VERTICAL}
                visible={createComputed(() => !searching() && section() === 'scale')}>
                <DensityRow />
              </box>
              <For each={visible} id={(it: SettingRow) => it.key}>
                {(it: SettingRow) => (
                  <SettingRowView
                    row={it}
                    crumb={searching()}
                    capturing={capturing}
                    onCapture={setCapturing}
                  />
                )}
              </For>
              <SettingsEmpty visible={visible.as((it) => it.length === 0)} />
            </box>
          </scrolledwindow>
        </box>

      </box>

      <button
        $type="overlay"
        class={cs.close}
        tooltipText={t.close()}
        focusable={false}
        halign={Gtk.Align.END}
        valign={Gtk.Align.START}
        onClicked={onClose}>
        <image iconName={icons.close} />
      </button>
    </overlay>
  )
}

function SettingsEmpty({ visible }: { readonly visible: Accessor<boolean> }) {
  const t = LL().settings

  return (
    <box class={cs.empty} orientation={Gtk.Orientation.VERTICAL} visible={visible}>
      <label class={cs.emptyTitle} label={t.noResultsTitle()} />
      <label class={cs.emptyHint} label={t.noResultsHint()} />
    </box>
  )
}
