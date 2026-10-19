import app from 'ags/gtk4/app'
import { Astal, Gdk, Gtk } from 'ags/gtk4'
import { Calendar, ControlCenter, Media, Notifications, Session, Tray, Wallpaper, Workspaces } from '@/app/features'
import { Divider } from '@/ui/components'
import { settings } from '@/app/modules/settings'
import { tray } from '@/infrastructure/tray'

import { bar, type BarSurface } from './state'

const cs = {
  root: 'bar',
  tray: 'bar-tray',
}

export function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
  const connector = gdkmonitor.connector ?? ''

  const reveal = (surface: BarSurface) =>
    bar.request.as((it) => (it?.output === connector && it.surface === surface ? it : null))

  const control = bar.request.as((it) => {
    if (it?.output !== connector) return null
    if (it.surface === 'control') return { page: 'root' as const }
    if (it.surface === 'wifi' || it.surface === 'bluetooth') return { page: it.surface }
    return null
  })

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
          <Tray />
          <Divider visible={tray.hasItems} />
          <Wallpaper connector={connector} reveal={reveal('wallpaper')} />
          <Notifications reveal={reveal('notifications')} />
          <Divider />
          <ControlCenter onSettings={() => settings.show()} reveal={control} />
          <Divider />
          <Calendar reveal={reveal('calendar')} />
          <Divider />
          <Session reveal={reveal('session')} />
        </box>
      </centerbox>
    </window>
  )
}
