import { dispatch } from '@/infrastructure/runtime'

import { Audio } from './store'

export function setVolume(volume: number): void {
  dispatch(Audio, (audio) => audio.setVolume(volume))
}

export function toggleMute(): void {
  dispatch(Audio, (audio) => audio.toggleMute)
}
