import AstalWp from 'gi://AstalWp'

import { emptyState, type AudioState } from '../store/state'

export function defaultSpeaker(wp: AstalWp.Wp): AstalWp.Endpoint | null {
  return wp.get_default_speaker() ?? null
}

export function snapshot(speaker: AstalWp.Endpoint | null): AudioState {
  if (!speaker) return emptyState

  return {
    hasSpeaker: true,
    volume: speaker.volume,
    isMuted: speaker.mute,
    icon: speaker.volumeIcon,
    description: speaker.description ?? '',
  }
}
