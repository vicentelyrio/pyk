import app from 'ags/gtk4/app'
import { Astal, Gdk, Gtk } from 'ags/gtk4'
import { Clock, Media, Notifications, Wallpaper, Workspaces } from '@/app/features'

const cs = {
  root: 'bar',
  tray: 'bar-tray',
}

export function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name={`bar-${gdkmonitor.connector}`}
      class={cs.root}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      valign={Gtk.Align.CENTER}
      application={app}>
      <centerbox>
        <Workspaces $type="start" />
        <Media $type="center" />
        <box $type="end" class={cs.tray}>
          <Wallpaper connector={gdkmonitor.connector ?? ''} />
          <Notifications />
          <Clock />
        </box>
      </centerbox>
    </window>
  )
}
