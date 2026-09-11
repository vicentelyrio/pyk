import AstalMpris from 'gi://AstalMpris'
import { Effect, Stream } from 'effect'

import { activePlayer, snapshot } from './player'
import { sameMprisState, type MprisState } from './state'

export const stateChanges: Stream.Stream<MprisState> = Stream.asyncPush<MprisState>(
  (emit) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const mpris = AstalMpris.get_default()
        let bound: (readonly [AstalMpris.Player, number])[] = []

        const push = () => emit.single(snapshot(activePlayer(mpris)))

        const unbind = () => {
          for (const [player, handler] of bound) player.disconnect(handler)
          bound = []
        }

        const rebind = () => {
          unbind()
          bound = mpris.get_players().map((p) => [p, p.connect('notify', push)] as const)
          push()
        }

        const handler = mpris.connect('notify::players', rebind)
        rebind()

        return { mpris, handler, unbind }
      }),
      ({ mpris, handler, unbind }) => Effect.sync(() => {
        mpris.disconnect(handler)
        unbind()
      }),
    ),
  { bufferSize: 1, strategy: 'sliding' },
).pipe(Stream.changesWith(sameMprisState))
