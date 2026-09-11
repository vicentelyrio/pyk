import AstalMpris from 'gi://AstalMpris'

import { emptyState, type MprisState } from './state'

export function activePlayer(mpris: AstalMpris.Mpris): AstalMpris.Player | null {
  const players = mpris.get_players()

  return players.find((p) => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING)
    ?? players[0]
    ?? null
}

export function snapshot(player: AstalMpris.Player | null): MprisState {
  if (!player) return emptyState

  return {
    hasPlayer: true,
    isPlaying: player.playbackStatus === AstalMpris.PlaybackStatus.PLAYING,
    identity: player.identity ?? '',
    title: player.title ?? '',
    artist: player.artist ?? '',
    canPlay: player.canPlay,
    canGoNext: player.canGoNext,
    canGoPrevious: player.canGoPrevious,
  }
}
