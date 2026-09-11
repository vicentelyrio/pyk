import { nextTrack, playPause, previousTrack } from './actions'
import { mprisState } from './bridge'
import { player } from './derived'

export const mpris = {
  ...player(mprisState),
  playPause,
  nextTrack,
  previousTrack,
} as const
