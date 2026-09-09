import { createState } from 'ags'
import { IconButton } from '@/ui/components'

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

// Centre cluster — media transport. Icon-only, hidden-when-idle per spec.
// TODO: wire to MPRIS (gi://AstalMpris) — play state, prev/next, art, source.
export function Media() {
  const [playing, setPlaying] = createState(false)

  return (
    <box class="media">
      <IconButton icon={icons.prev} tooltip="Previous" onClicked={todo('previous track')} />
      <button
        class="bar-btn play"
        tooltipText="Play / pause"
        onClicked={() => setPlaying((p) => !p)}
      >
        <image iconName={playing.as((p) => (p ? icons.pause : icons.play))} />
      </button>
      <IconButton icon={icons.next} tooltip="Next" onClicked={todo('next track')} />
      <IconButton
        icon={icons.media}
        tooltip="Now playing"
        class="media-toggle"
        onClicked={todo('now playing')}
      />
    </box>
  )
}

