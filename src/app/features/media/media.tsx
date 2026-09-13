import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import type { Accessor } from 'ags'
import { Popover } from '@/ui/components'
import { mpris } from '@/infrastructure/mpris'

const cs = {
  root: 'media',
  disabled: 'media-disabled',
  controls: 'media-controls',
  control: 'media-control',
  play: 'media-play',
  card: 'media-card',
  body: 'media-body',
  header: 'media-header',
  cover: 'media-cover',
  coverIcon: 'media-cover-icon',
  meta: 'media-meta',
  title: 'media-title',
  artist: 'media-artist',
  source: 'media-source',
  progress: 'media-progress',
  track: 'media-track',
  times: 'media-times',
  time: 'media-time',
}

const icons = {
  previous: 'pyk-skip-back-symbolic',
  play: 'pyk-play-symbolic',
  pause: 'pyk-pause-symbolic',
  next: 'pyk-skip-forward-symbolic',
  music: 'pyk-music-symbolic',
}

export function Media({ className }: { className?: string }) {
  return (
    <Popover
      on="hover"
      className={clsx(cs.root, !mpris.hasPlayer && cs.disabled, className)}
      contentClassName={cs.card}
      trigger={<MediaControls />}>
      <MediaCard />
    </Popover>
  )
}

function MediaControls() {
  return (
    <box
      class={cs.controls}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}>
      <MediaControl
        icon={icons.previous}
        tooltip="Previous"
        enabled={mpris.canGoPrevious}
        onClicked={mpris.previousTrack}
      />
      <MediaControl
        className={cs.play}
        icon={mpris.isPlaying.as((playing) => (playing ? icons.pause : icons.play))}
        tooltip="Play / pause"
        enabled={mpris.canPlay}
        onClicked={mpris.playPause}
      />
      <MediaControl
        icon={icons.next}
        tooltip="Next"
        enabled={mpris.canGoNext}
        onClicked={mpris.nextTrack}
      />
    </box>
  )
}

type MediaControlProps = {
  readonly icon: string | Accessor<string>
  readonly tooltip: string
  readonly enabled: Accessor<boolean>
  readonly className?: string
  readonly onClicked: () => void
}

function MediaControl({ icon, tooltip, enabled, className, onClicked }: MediaControlProps) {
  return (
    <button
      class={clsx(cs.control, className)}
      tooltipText={tooltip}
      sensitive={enabled}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClicked={onClicked}>
      <image iconName={icon} />
    </button>
  )
}

function MediaCard() {
  return (
    <box class={cs.body} orientation={Gtk.Orientation.VERTICAL}>
      <box class={cs.header}>
        <MediaCover />
        <MediaMeta />
      </box>
      <MediaProgress />
    </box>
  )
}

function MediaCover() {
  return (
    <box
      class={cs.cover}
      css={mpris.coverArt.as(buildCover)}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      hexpand={false}
      vexpand={false}>
      <image
        class={cs.coverIcon}
        iconName={icons.music}
        visible={mpris.coverArt.as((art) => !art)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        hexpand
        vexpand
      />
    </box>
  )
}

function MediaMeta() {
  return (
    <box
      class={cs.meta}
      orientation={Gtk.Orientation.VERTICAL}
      valign={Gtk.Align.CENTER}
      hexpand>
      <MediaMetaLine className={cs.title} text={mpris.title} />
      <MediaMetaLine className={cs.artist} text={mpris.artist} />
      <MediaMetaLine className={cs.source} text={mpris.identity} />
    </box>
  )
}

type MediaMetaLineProps = {
  readonly className: string
  readonly text: Accessor<string>
}

function MediaMetaLine({ className, text }: MediaMetaLineProps) {
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

function MediaProgress() {
  return (
    <box class={cs.progress} orientation={Gtk.Orientation.VERTICAL}>
      <levelbar
        class={cs.track}
        mode={Gtk.LevelBarMode.CONTINUOUS}
        value={mpris.progress}
      />
      <box class={cs.times}>
        <MediaTime text={mpris.position.as(elapsed)} halign={Gtk.Align.START} />
        <MediaTime text={mpris.remaining.as(countdown)} halign={Gtk.Align.END} />
      </box>
    </box>
  )
}

type MediaTimeProps = {
  readonly text: Accessor<string>
  readonly halign: Gtk.Align
}

function MediaTime({ text, halign }: MediaTimeProps) {
  return <label class={cs.time} label={text} halign={halign} hexpand />
}

function elapsed(seconds: number): string {
  const total = Math.max(Math.round(seconds), 0)
  return `${Math.floor(total / 60)}:${`${total % 60}`.padStart(2, '0')}`
}

function countdown(seconds: number): string {
  return `-${elapsed(seconds)}`
}

function buildCover(art: string | undefined): string {
  return art ? `background-image: url("file://${art}");` : ''
}
