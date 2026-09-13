import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For, createComputed, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { Popover } from '@/ui/components'
import { wallpaper } from '@/infrastructure/wallpaper'

const cs = {
  root: 'wallpaper',
  trigger: 'wallpaper-trigger',
  panel: 'wallpaper-panel',
  header: 'wallpaper-header',
  title: 'wallpaper-title',
  directory: 'wallpaper-directory',
  grid: 'wallpaper-grid',
  row: 'wallpaper-row',
  thumb: 'wallpaper-thumb',
  empty: 'wallpaper-empty',
  footer: 'wallpaper-footer',
  name: 'wallpaper-name',
  size: 'wallpaper-size',

  selected: '--selected',
}

const icons = {
  image: 'pyk-image-symbolic',
}

const COLUMNS = 3

export type WallpaperProps = {
  readonly connector: string
  readonly className?: string
}

export function Wallpaper({ connector, className }: WallpaperProps) {
  const current = wallpaper.forOutput(connector)

  return (
    <Popover
      className={clsx(cs.root, className)}
      contentClassName={cs.panel}
      tooltip="Wallpaper"
      trigger={<image class={cs.trigger} iconName={icons.image} />}>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <WallpaperHeader />
        <WallpaperGrid connector={connector} current={current} />
        <WallpaperFooter current={current} />
      </box>
    </Popover>
  )
}

function WallpaperHeader() {
  return (
    <box class={cs.header}>
      <label class={cs.title} label="Wallpaper" xalign={0} hexpand />
      <label class={cs.directory} label={wallpaper.label} ellipsize={Pango.EllipsizeMode.START} />
    </box>
  )
}

type WallpaperGridProps = {
  readonly connector: string
  readonly current: Accessor<string>
}

function WallpaperGrid({ connector, current }: WallpaperGridProps) {
  const rows = createComputed(() => wallpaper.rows(wallpaper.images().map((it) => it.path), COLUMNS))

  return (
    <box class={cs.grid} orientation={Gtk.Orientation.VERTICAL}>
      <For each={rows} id={(row: readonly string[]) => row.join('\n')}>
        {(row: readonly string[]) => (
          <box class={cs.row} halign={Gtk.Align.START}>
            {row.map((path) => <WallpaperThumb path={path} connector={connector} current={current} />)}
          </box>
        )}
      </For>
      <label
        class={cs.empty}
        label={wallpaper.label.as((it) => `No images in ${it}`)}
        visible={rows.as((it) => it.length === 0)}
      />
    </box>
  )
}

type WallpaperThumbProps = {
  readonly path: string
  readonly connector: string
  readonly current: Accessor<string>
}

function WallpaperThumb({ path, connector, current }: WallpaperThumbProps) {
  const thumbnail = createComputed(() => wallpaper.images().find((it) => it.path === path)?.thumbnail ?? null)

  return (
    <button
      class={current.as((it) => clsx(cs.thumb, it === path && cs.selected))}
      css={thumbnail.as((it) => (it ? `background-image: url("file://${it}");` : ''))}
      tooltipText={GLib.path_get_basename(path)}
      focusable={false}
      onClicked={() => wallpaper.assign(connector, path)}
    />
  )
}

function WallpaperFooter({ current }: { readonly current: Accessor<string> }) {
  const selected = createComputed(() => wallpaper.images().find((it) => it.path === current()) ?? null)

  return (
    <box class={cs.footer}>
      <label
        class={cs.name}
        label={createComputed(() => {
          const path = current()
          return path ? GLib.path_get_basename(path) : 'No wallpaper'
        })}
        xalign={0}
        ellipsize={Pango.EllipsizeMode.MIDDLE}
        hexpand
      />
      <label class={cs.size} label={selected.as((it) => (it ? `${it.width} × ${it.height}` : ''))} />
    </box>
  )
}
