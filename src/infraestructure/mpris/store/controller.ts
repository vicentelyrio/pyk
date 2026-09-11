import AstalMpris from 'gi://AstalMpris'
import { Context, Effect, Layer, Stream, SubscriptionRef } from 'effect'

import { stateChanges } from './connection'
import { activePlayer } from './player'
import { emptyState, type MprisState } from './state'

export class Mpris extends Context.Service<Mpris, {
  readonly changes: Stream.Stream<MprisState>
  readonly snapshot: Effect.Effect<MprisState>
  readonly playPause: Effect.Effect<void>
  readonly next: Effect.Effect<void>
  readonly previous: Effect.Effect<void>
}>()('pyk/Mpris') {}

export const MprisLayer = Layer.effect(
  Mpris,
  Effect.gen(function* () {
    const state = yield* SubscriptionRef.make(emptyState)

    yield* Stream.runForEach(stateChanges, (next) => SubscriptionRef.set(state, next)).pipe(
      Effect.tapCause((cause) => Effect.logError('mpris: state stream stopped', cause)),
      Effect.forkScoped,
    )

    const onPlayer = (run: (player: AstalMpris.Player) => void) =>
      Effect.sync(() => {
        const player = activePlayer(AstalMpris.get_default())
        if (player) run(player)
      })

    return {
      changes: SubscriptionRef.changes(state),
      snapshot: SubscriptionRef.get(state),
      playPause: onPlayer((p) => p.play_pause()),
      next: onPlayer((p) => p.next()),
      previous: onPlayer((p) => p.previous()),
    }
  }),
)
