import { mprisState, nextTrack, playPause, previousTrack } from './store'

import { player } from './derived'

export const mpris = {
  ...player(mprisState),
  playPause,
  nextTrack,
  previousTrack,
} as const
