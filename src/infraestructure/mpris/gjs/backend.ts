import AstalMpris from 'gi://AstalMpris'
import { Layer } from 'effect'

import { attempt } from '@/infraestructure/effect'

import { MprisBackend } from '../store/backend'
import { stateChanges } from './connection'
import { activePlayer } from './player'

const onPlayer = (action: string, run: (player: AstalMpris.Player) => void) =>
  attempt('mpris', action, () => {
    const player = activePlayer(AstalMpris.get_default())
    if (player) run(player)
  })

export const MprisBackendLive = Layer.succeed(MprisBackend, {
  changes: stateChanges,
  playPause: onPlayer('playPause', (p) => p.play_pause()),
  next: onPlayer('next', (p) => p.next()),
  previous: onPlayer('previous', (p) => p.previous()),
})
