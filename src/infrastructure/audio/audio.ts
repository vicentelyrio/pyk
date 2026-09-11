import { setVolume, toggleMute } from './actions'
import { audioState } from './bridge'
import { speaker } from './derived'

export const audio = {
  ...speaker(audioState),
  setVolume,
  toggleMute,
} as const
