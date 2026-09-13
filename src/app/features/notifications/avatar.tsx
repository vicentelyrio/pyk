import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'

const cs = {
  root: 'notifs-avatar',
}

const TINTS = ['--accent', '--info', '--ok', '--warn', '--attention'] as const

export function NotificationAvatar({ appName }: { appName: string }) {
  return (
    <box
      class={clsx(cs.root, tint(appName))}
      valign={Gtk.Align.START}
      hexpand={false}
      vexpand={false}>
      <label
        label={initial(appName)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        hexpand
        vexpand
      />
    </box>
  )
}

function initial(appName: string): string {
  return (appName.trim().charAt(0) || '?').toUpperCase()
}

function tint(appName: string): string {
  let hash = 0
  for (let i = 0; i < appName.length; i++) hash = (hash + appName.charCodeAt(i)) % TINTS.length
  return TINTS[hash]!
}
