import { IconButton } from '@/ui/components'
import { mpris } from '@/infrastructure/mpris'

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
// TODO: album art and source badge — mpris.hasPlayer drives hidden-when-idle.
export function Media() {
  return (
    <box class="media">
      <IconButton icon={icons.prev} tooltip="Previous" onClicked={mpris.previousTrack} />
      <button
        class="bar-btn play"
        tooltipText="Play / pause"
        onClicked={mpris.playPause}
      >
        <image iconName={mpris.isPlaying.as((p) => (p ? icons.pause : icons.play))} />
      </button>
      <IconButton icon={icons.next} tooltip="Next" onClicked={mpris.nextTrack} />
      <IconButton
        icon={icons.media}
        tooltip="Now playing"
        class="media-toggle"
        onClicked={todo('now playing')}
      />
    </box>
  )
}

