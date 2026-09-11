import AstalMpris from 'gi://AstalMpris'
import { Layer } from 'effect'

import { attempt } from '@/infraestructure/effect'

import { MprisBackend } from '../store/backend'
import { stateChanges } from './connection'
import { activePlayer } from './player'

export const MprisBackendLive = Layer.sync(MprisBackend, () => {
  const mpris = AstalMpris.get_default()

  const onPlayer = (action: string, run: (player: AstalMpris.Player) => void) =>
    attempt('mpris', action, () => {
      const player = activePlayer(mpris)
      if (player) run(player)
    })

  return {
    changes: stateChanges(mpris),
    playPause: onPlayer('playPause', (p) => p.play_pause()),
    next: onPlayer('next', (p) => p.next()),
    previous: onPlayer('previous', (p) => p.previous()),
  }
})
