import AstalMpris from 'gi://AstalMpris'
import { Effect, Stream, SubscriptionRef } from 'effect'

import { stateChanges } from './connection'
import { activePlayer } from './player'
import { emptyState } from './state'

export class Mpris extends Effect.Service<Mpris>()('pyk/Mpris', {
  scoped: Effect.gen(function* () {
    const state = yield* SubscriptionRef.make(emptyState)

    yield* Stream.runForEach(stateChanges, (next) => SubscriptionRef.set(state, next)).pipe(
      Effect.tapErrorCause((cause) => Effect.logError('mpris: state stream stopped', cause)),
      Effect.forkScoped,
    )

    const onPlayer = (run: (player: AstalMpris.Player) => void) =>
      Effect.sync(() => {
        const player = activePlayer(AstalMpris.get_default())
        if (player) run(player)
      })

    return {
      changes: state.changes,
      snapshot: SubscriptionRef.get(state),
      playPause: onPlayer((p) => p.play_pause()),
      next: onPlayer((p) => p.next()),
      previous: onPlayer((p) => p.previous()),
    } as const
  }),
}) {}
