import AstalMpris from 'gi://AstalMpris'
import GLib from 'gi://GLib'

import { appOf, originOf } from '../derived/channel'
import { emptyState, type MprisLoop, type MprisShuffle, type MprisState } from '../store/state'

const positive = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0)

function loopOf(status: AstalMpris.Loop): MprisLoop {
  if (status === AstalMpris.Loop.NONE) return 'none'
  if (status === AstalMpris.Loop.TRACK) return 'track'
  if (status === AstalMpris.Loop.PLAYLIST) return 'playlist'
  return 'unsupported'
}

function shuffleOf(status: AstalMpris.Shuffle): MprisShuffle {
  if (status === AstalMpris.Shuffle.ON) return 'on'
  if (status === AstalMpris.Shuffle.OFF) return 'off'
  return 'unsupported'
}

function metaString(player: AstalMpris.Player, key: string): string {
  const value = player.get_meta(key)
  return value?.is_of_type(new GLib.VariantType('s')) ? value.get_string()[0] : ''
}

export function activePlayer(mpris: AstalMpris.Mpris): AstalMpris.Player | null {
  const players = mpris.get_players()

  return players.find((p) => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING)
    ?? players[0]
    ?? null
}

export function snapshot(player: AstalMpris.Player | null): MprisState {
  if (!player) return emptyState

  const url = metaString(player, 'xesam:url')

  return {
    hasPlayer: true,
    isPlaying: player.playbackStatus === AstalMpris.PlaybackStatus.PLAYING,
    identity: player.identity ?? '',
    title: player.title ?? '',
    artist: player.artist ?? '',
    album: player.album ?? '',
    coverArt: player.coverArt ?? '',
    url,
    channel: { app: appOf(player.entry ?? '', player.busName ?? ''), origin: originOf(url), name: '' },
    position: positive(player.position),
    length: positive(player.length),
    canPlay: player.canPlay,
    canSeek: player.canSeek,
    canGoNext: player.canGoNext,
    canGoPrevious: player.canGoPrevious,
    loop: loopOf(player.loopStatus),
    shuffle: shuffleOf(player.shuffleStatus),
  }
}
