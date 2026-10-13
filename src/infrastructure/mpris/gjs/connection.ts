import AstalMpris from 'gi://AstalMpris'
import { Duration, Effect, Stream } from 'effect'

import { StartupConfig } from '@/infrastructure/config/store/references'
import { fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import type { MprisState } from '../store/state'
import { channelResolver } from './channel'
import { activePlayer, snapshot } from './player'

export function stateChanges(mpris: AstalMpris.Mpris): Stream.Stream<MprisState, SourceError> {
  const snap = () => snapshot(activePlayer(mpris))

  return Stream.unwrap(
    Effect.gen(function* () {
      const { media } = yield* StartupConfig
      const channels = yield* channelResolver(media)
      const ticks = Stream.tick(Duration.millis(media.progressInterval)).pipe(
        Stream.map(snap),
        Stream.filter((state) => state.isPlaying),
      )

      return fromSignal('mpris', mpris, 'notify::players', () => mpris.get_players()).pipe(
        Stream.switchMap((players) =>
          Stream.mergeAll(
            [
              Stream.sync(snap),
              ticks,
              channels.fetched.pipe(Stream.map(snap)),
              ...players.map((player) => fromSignal('mpris', player, 'notify', snap)),
            ],
            { concurrency: 'unbounded' },
          ),
        ),
        Stream.mapEffect(channels.apply),
        reconnecting,
      )
    }),
  )
}
