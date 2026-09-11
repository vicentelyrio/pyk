import AstalWp from 'gi://AstalWp'
import { Layer } from 'effect'

import { attempt } from '@/infrastructure/effect'

import { AudioBackend } from '../store/backend'
import { stateChanges } from './connection'
import { defaultSpeaker } from './speaker'

const clamp = (volume: number) => Math.min(1, Math.max(0, volume))

export const AudioBackendLive = Layer.sync(AudioBackend, () => {
  const wp = AstalWp.get_default()

  const onSpeaker = (action: string, run: (speaker: AstalWp.Endpoint) => void) =>
    attempt('audio', action, () => {
      const speaker = defaultSpeaker(wp)
      if (speaker) run(speaker)
    })

  return {
    changes: stateChanges(wp),
    setVolume: (volume: number) =>
      onSpeaker('setVolume', (speaker) => {
        speaker.volume = clamp(volume)
      }),
    toggleMute: onSpeaker('toggleMute', (speaker) => {
      speaker.mute = !speaker.mute
    }),
  }
})
