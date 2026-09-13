import Gio from 'gi://Gio'
import app from 'ags/gtk4/app'
import { Astal, Gdk, Gtk } from 'ags/gtk4'
import { onCleanup } from 'ags'
import { wallpaper } from '@/infrastructure/wallpaper'

const cs = {
  root: 'wallpaper-window',
  picture: 'wallpaper-picture',
}

const FIT: Record<string, Gtk.ContentFit> = {
  cover: Gtk.ContentFit.COVER,
  contain: Gtk.ContentFit.CONTAIN,
  fill: Gtk.ContentFit.FILL,
}

export function WallpaperWindow(gdkmonitor: Gdk.Monitor) {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor
  const image = wallpaper.forOutput(gdkmonitor.connector ?? '')

  const attach = (self: Astal.Window) => {
    const picture = new Gtk.Picture({ cssClasses: [cs.picture], canShrink: true, hexpand: true, vexpand: true })

    const sync = () => {
      const path = image()
      picture.set_file(path ? Gio.File.new_for_path(path) : null)
      picture.set_content_fit(FIT[wallpaper.fit()] ?? Gtk.ContentFit.COVER)
    }

    self.set_child(picture)
    sync()

    const disposeImage = image.subscribe(sync)
    const disposeFit = wallpaper.fit.subscribe(sync)

    onCleanup(() => {
      disposeImage()
      disposeFit()
    })
  }

  return (
    <window
      visible
      name={`wallpaper-${gdkmonitor.connector}`}
      namespace="pyk-wallpaper"
      class={cs.root}
      gdkmonitor={gdkmonitor}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.BACKGROUND}
      keymode={Astal.Keymode.NONE}
      application={app}
      $={(self) => attach(self as Astal.Window)}
    />
  )
}
