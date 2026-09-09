import GLib from 'gi://GLib'
import { Gtk } from 'ags/gtk4'
import { createPoll } from 'ags/time'
import { createState } from 'ags'
import { Divider, IconButton } from '@/ui/components'

const icons = {
  overview: 'view-grid-symbolic',
  prev: 'media-skip-backward-symbolic',
  play: 'media-playback-start-symbolic',
  pause: 'media-playback-pause-symbolic',
  next: 'media-skip-forward-symbolic',
  media: 'applications-multimedia-symbolic',
  clipboard: 'edit-copy-symbolic',
  notifications: 'preferences-system-notifications-symbolic',
  wallpaper: 'preferences-desktop-wallpaper-symbolic',
  wifi: 'network-wireless-signal-excellent-symbolic',
  bluetooth: 'bluetooth-active-symbolic',
  volume: 'audio-volume-high-symbolic',
  power: 'system-shutdown-symbolic',
} as const

const todo = (what: string) => () => console.info(`[bar] TODO: open ${what}`)

function Clock() {
  const now = createPoll(
    GLib.DateTime.new_now_local(),
    1000,
    () => GLib.DateTime.new_now_local(),
  )
  return (
    <button class="pill clock" tooltipText="Calendar" onClicked={todo('calendar')}>
      <box>
        <label class="date" label={now.as((t) => t.format('%a %-d %b') ?? '')} />
        <label class="time" label={now.as((t) => t.format('%H:%M') ?? '')} />
      </box>
    </button>
  )
}

// TODO: bind the three glyphs to AstalNetwork / AstalBluetooth / AstalWp.
function Control() {
  return (
    <button class="pill control" tooltipText="Control centre" onClicked={todo('control centre')}>
      <box>
        <image iconName={icons.wifi} />
        <image iconName={icons.bluetooth} />
        <image iconName={icons.volume} />
      </box>
    </button>
  )
}

// Right cluster — quick-access surfaces, the control pill, the clock, session.
export function Tray() {
  // TODO: AstalNotifd — unread count drives the badge.
  const [hasNotifs] = createState(false)

  return (
    <box class="tray">
      <IconButton icon={icons.clipboard} tooltip="Clipboard history" onClicked={todo('clipboard')} />
      <overlay class="notif-wrap">
        <IconButton icon={icons.notifications} tooltip="Notifications" onClicked={todo('notifications')} />
        <box
          $type="overlay"
          class="badge"
          halign={Gtk.Align.END}
          valign={Gtk.Align.START}
          visible={hasNotifs}
        />
      </overlay>
      <IconButton icon={icons.wallpaper} tooltip="Wallpaper" onClicked={todo('wallpaper picker')} />
      <Divider />
      <Control />
      <Clock />
      <IconButton
        icon={icons.power}
        tooltip="Session"
        variant="danger"
        onClicked={todo('session menu')}
      />
    </box>
  )
}
