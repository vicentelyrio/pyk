import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { createComputed, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { audio } from '@/infrastructure/audio'
import { mpris } from '@/infrastructure/mpris'

const cs = {
  root: 'player',
  art: 'player-art',
  cover: 'player-cover',
  placeholder: 'player-placeholder',
  scrim: 'player-scrim',
  badge: 'player-badge',
  meta: 'player-meta',
  source: 'player-source',
  title: 'player-title',
  artist: 'player-artist',
  album: 'player-album',
  seek: 'player-seek',
  times: 'player-times',
  time: 'player-time',
  live: 'player-live',
  liveDot: 'player-live-dot',
  liveLabel: 'player-live-label',
  controls: 'player-controls',
  control: 'player-control',
  step: 'player-step',
  play: 'player-play',
  volume: 'player-volume',
  volumeIcon: 'player-volume-icon',
  volumeValue: 'player-volume-value',

  on: '--on',
}

const icons = {
  music: 'pyk-music-symbolic',
  shuffle: 'pyk-shuffle-symbolic',
  previous: 'pyk-skip-back-symbolic',
  play: 'pyk-play-symbolic',
  pause: 'pyk-pause-symbolic',
  next: 'pyk-skip-forward-symbolic',
  repeat: 'pyk-repeat-symbolic',
  repeatOne: 'pyk-repeat-one-symbolic',
  volume: 'pyk-volume-symbolic',
  volumeMuted: 'pyk-volume-muted-symbolic',
}

export function Player({ className }: { className?: string }) {
  return (
    <box
      class={clsx(cs.root, className)}
      orientation={Gtk.Orientation.VERTICAL}
      visible={mpris.hasPlayer}>
      <PlayerArt />
      <PlayerMeta />
      <PlayerSeek />
      <PlayerLive />
      <PlayerControls />
      <PlayerVolume />
    </box>
  )
}

function PlayerArt() {
  const badge = createComputed(() => {
    if (!mpris.isPlaying()) return 'PAUSED'
    return mpris.isLive() ? 'LIVE' : 'PLAYING'
  })

  return (
    <overlay class={cs.art}>
      <box class={cs.cover} css={mpris.coverArt.as(cover)}>
        <image
          class={cs.placeholder}
          iconName={icons.music}
          visible={mpris.coverArt.as((art) => !art)}
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          hexpand
          vexpand
        />
      </box>
      <box $type="overlay" class={cs.scrim} valign={Gtk.Align.END} />
      <label
        $type="overlay"
        class={cs.badge}
        label={badge}
        halign={Gtk.Align.END}
        valign={Gtk.Align.END}
      />
    </overlay>
  )
}

function PlayerMeta() {
  const source = createComputed(() => {
    const player = mpris.identity().toUpperCase()
    const sink = audio.description()
    return sink ? `${player} → ${sink}` : player
  })

  return (
    <box class={cs.meta} orientation={Gtk.Orientation.VERTICAL}>
      <PlayerLine className={cs.source} text={source} />
      <PlayerLine className={cs.title} text={mpris.title} />
      <PlayerLine className={cs.artist} text={mpris.artist} />
      <PlayerLine className={cs.album} text={mpris.album} />
    </box>
  )
}

type PlayerLineProps = {
  readonly className: string
  readonly text: Accessor<string>
}

function PlayerLine({ className, text }: PlayerLineProps) {
  return (
    <label
      class={className}
      label={text}
      visible={text.as(Boolean)}
      xalign={0}
      maxWidthChars={1}
      ellipsize={Pango.EllipsizeMode.END}
      hexpand
    />
  )
}

function PlayerSeek() {
  return (
    <box
      class={cs.seek}
      orientation={Gtk.Orientation.VERTICAL}
      visible={mpris.isLive.as((live) => !live)}>
      <slider
        min={0}
        max={1}
        step={0.001}
        value={mpris.progress}
        sensitive={mpris.canSeek}
        onChangeValue={(self: Gtk.Range) => mpris.seek(self.get_value() * mpris.length())}
      />
      <box class={cs.times}>
        <label class={cs.time} label={mpris.position.as(elapsed)} xalign={0} hexpand />
        <label class={cs.time} label={mpris.remaining.as(countdown)} xalign={1} hexpand />
      </box>
    </box>
  )
}

function PlayerLive() {
  return (
    <box class={cs.live} visible={mpris.isLive}>
      <box class={cs.liveDot} valign={Gtk.Align.CENTER} />
      <label class={cs.liveLabel} label="LIVE STREAM" />
    </box>
  )
}

function PlayerControls() {
  return (
    <box class={cs.controls}>
      <PlayerControl
        className={mpris.isShuffled.as((on) => clsx(cs.control, on && cs.on))}
        icon={icons.shuffle}
        tooltip="Shuffle"
        enabled={mpris.hasShuffle}
        halign={Gtk.Align.START}
        onClicked={mpris.toggleShuffle}
      />
      <PlayerControl
        className={clsx(cs.control, cs.step)}
        icon={icons.previous}
        tooltip="Previous"
        enabled={mpris.canGoPrevious}
        onClicked={mpris.previousTrack}
      />
      <PlayerControl
        className={cs.play}
        icon={mpris.isPlaying.as((playing) => (playing ? icons.pause : icons.play))}
        tooltip="Play / pause"
        enabled={mpris.canPlay}
        onClicked={mpris.playPause}
      />
      <PlayerControl
        className={clsx(cs.control, cs.step)}
        icon={icons.next}
        tooltip="Next"
        enabled={mpris.canGoNext}
        onClicked={mpris.nextTrack}
      />
      <PlayerControl
        className={mpris.isLooping.as((on) => clsx(cs.control, on && cs.on))}
        icon={mpris.loop.as((it) => (it === 'track' ? icons.repeatOne : icons.repeat))}
        tooltip={mpris.loop.as((it) => `Repeat ${it === 'unsupported' ? 'off' : it}`)}
        enabled={mpris.hasLoop}
        halign={Gtk.Align.END}
        onClicked={mpris.cycleLoop}
      />
    </box>
  )
}

type PlayerControlProps = {
  readonly icon: string | Accessor<string>
  readonly tooltip: string | Accessor<string>
  readonly enabled: Accessor<boolean>
  readonly className: string | Accessor<string>
  readonly halign?: Gtk.Align
  readonly onClicked: () => void
}

function PlayerControl({ icon, tooltip, enabled, className, halign, onClicked }: PlayerControlProps) {
  return (
    <button
      class={className}
      tooltipText={tooltip}
      sensitive={enabled}
      focusable={false}
      halign={halign ?? Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      hexpand
      onClicked={onClicked}>
      <image iconName={icon} />
    </button>
  )
}

function PlayerVolume() {
  const level = createComputed(() => (audio.isMuted() ? 0 : audio.volume()))

  return (
    <box class={cs.volume} visible={audio.hasSpeaker}>
      <button class={cs.volumeIcon} focusable={false} onClicked={audio.toggleMute}>
        <image iconName={audio.isMuted.as((muted) => (muted ? icons.volumeMuted : icons.volume))} />
      </button>
      <slider
        hexpand
        min={0}
        max={1}
        step={0.01}
        value={level}
        onChangeValue={(self: Gtk.Range) => audio.setVolume(self.get_value())}
      />
      <label class={cs.volumeValue} label={level.as(percent)} xalign={1} />
    </box>
  )
}

function cover(art: string): string {
  return art ? `background-image: url("file://${art}");` : ''
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

function elapsed(seconds: number): string {
  const total = Math.max(Math.round(seconds), 0)
  return `${Math.floor(total / 60)}:${`${total % 60}`.padStart(2, '0')}`
}

function countdown(seconds: number): string {
  return `-${elapsed(seconds)}`
}
