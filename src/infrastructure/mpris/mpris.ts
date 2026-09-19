import { cycleLoop, nextTrack, playPause, previousTrack, seek, toggleShuffle } from './actions'
import { mprisState } from './bridge'
import { player } from './derived'

export const mpris = {
  ...player(mprisState),
  playPause,
  nextTrack,
  previousTrack,
  seek,
  toggleShuffle,
  cycleLoop,
} as const
