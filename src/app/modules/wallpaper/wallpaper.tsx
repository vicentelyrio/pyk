import Gio from 'gi://Gio'
import app from 'ags/gtk4/app'
import { Astal, Gdk, Gtk } from 'ags/gtk4'
import { onCleanup } from 'ags'
import { wallpaper } from '@/infrastructure/wallpaper'

const cs = {
  root: 'wallpaper-window',
  picture: 'wallpaper-picture',

  shown: '--shown',
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
    const layers = [0, 1].map(() =>
      new Gtk.Picture({ cssClasses: [cs.picture], canShrink: true, hexpand: true, vexpand: true }))

    const overlay = new Gtk.Overlay({ child: layers[0] })
    overlay.add_overlay(layers[1]!)
    self.set_child(overlay)

    let front = 0

    const fit = () => {
      for (const layer of layers) layer.set_content_fit(FIT[wallpaper.fit()] ?? Gtk.ContentFit.COVER)
    }

    const show = () => {
      const path = image()
      const incoming = layers[1 - front]!
      const outgoing = layers[front]!

      incoming.set_file(path ? Gio.File.new_for_path(path) : null)
      incoming.add_css_class(cs.shown)
      outgoing.remove_css_class(cs.shown)
      front = 1 - front
    }

    fit()
    show()

    const disposeImage = image.subscribe(show)
    const disposeFit = wallpaper.fit.subscribe(fit)

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
