import app from 'ags/gtk4/app'
import { Astal, Gdk } from 'ags/gtk4'
import { Media, Tray, Workspaces } from '@/app/features'

export function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name={`bar-${gdkmonitor.connector}`}
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox>
        <Workspaces $type="start" />
        <Media $type="center" />
        <Tray $type="end" />
      </centerbox>
    </window>
  )
}
