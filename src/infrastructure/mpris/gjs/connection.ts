import AstalMpris from 'gi://AstalMpris'
import { Schedule, Stream } from 'effect'

import { fromSignal, logFailure, type SourceError } from '@/infrastructure/effect'

import type { MprisState } from '../store/state'
import { activePlayer, snapshot } from './player'

const reconnect = Schedule.spaced('5 seconds').pipe(Schedule.jittered)

export function stateChanges(mpris: AstalMpris.Mpris): Stream.Stream<MprisState, SourceError> {
  const snap = () => snapshot(activePlayer(mpris))

  const ticks = Stream.tick('1 second').pipe(
    Stream.map(snap),
    Stream.filter((state) => state.isPlaying),
  )

  return fromSignal('mpris', mpris, 'notify::players', () => mpris.get_players()).pipe(
    Stream.switchMap((players) =>
      Stream.mergeAll(
        [
          Stream.sync(snap),
          ticks,
          ...players.map((player) => fromSignal('mpris', player, 'notify', snap)),
        ],
        { concurrency: 'unbounded' },
      ),
    ),
    Stream.tapError((error) => logFailure(error)),
    Stream.retry(reconnect),
  )
}
