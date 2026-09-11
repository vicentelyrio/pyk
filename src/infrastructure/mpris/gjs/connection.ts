import AstalMpris from 'gi://AstalMpris'
import { Schedule, Stream } from 'effect'

import { fromSignal, logFailure, type SourceError } from '@/infrastructure/effect'

import type { MprisState } from '../store/state'
import { activePlayer, snapshot } from './player'

const reconnect = Schedule.spaced('5 seconds').pipe(Schedule.jittered)

export function stateChanges(mpris: AstalMpris.Mpris): Stream.Stream<MprisState, SourceError> {
  const snap = () => snapshot(activePlayer(mpris))

  return fromSignal('mpris', mpris, 'notify::players', () => mpris.get_players()).pipe(
    Stream.switchMap((players) =>
      Stream.mergeAll(
        [
          Stream.sync(snap),
          ...players.map((player) => fromSignal('mpris', player, 'notify', snap)),
        ],
        { concurrency: 'unbounded' },
      ),
    ),
    Stream.tapError((error) => logFailure(error)),
    Stream.retry(reconnect),
  )
}
