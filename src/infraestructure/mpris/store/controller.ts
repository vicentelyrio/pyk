import AstalMpris from 'gi://AstalMpris'
import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, attempt, makeStore } from '@/infraestructure/effect'

import { stateChanges } from './connection'
import { activePlayer } from './player'
import { emptyState, type MprisState } from './state'

export class Mpris extends Context.Service<Mpris, {
  readonly changes: Stream.Stream<MprisState>
  readonly snapshot: Effect.Effect<MprisState>
  readonly playPause: Effect.Effect<void, ActionError>
  readonly next: Effect.Effect<void, ActionError>
  readonly previous: Effect.Effect<void, ActionError>
}>()('pyk/Mpris') {}

export const MprisLayer = Layer.effect(
  Mpris,
  Effect.gen(function* () {
    const store = yield* makeStore('mpris', emptyState, stateChanges)

    const onPlayer = (action: string, run: (player: AstalMpris.Player) => void) =>
      attempt('mpris', action, () => {
        const player = activePlayer(AstalMpris.get_default())
        if (player) run(player)
      })

    return {
      ...store,
      playPause: onPlayer('playPause', (p) => p.play_pause()),
      next: onPlayer('next', (p) => p.next()),
      previous: onPlayer('previous', (p) => p.previous()),
    }
  }),
)
