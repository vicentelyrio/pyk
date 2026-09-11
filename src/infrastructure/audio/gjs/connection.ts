import AstalWp from 'gi://AstalWp'
import { Schedule, Stream } from 'effect'

import { fromSignal, logFailure, type SourceError } from '@/infrastructure/effect'

import { emptyState, type AudioState } from '../store/state'
import { defaultSpeaker, snapshot } from './speaker'

const reconnect = Schedule.spaced('5 seconds').pipe(Schedule.jittered)

export function stateChanges(wp: AstalWp.Wp): Stream.Stream<AudioState, SourceError> {
  return fromSignal('audio', wp, 'notify::default-speaker', () => defaultSpeaker(wp)).pipe(
    Stream.switchMap((speaker) =>
      speaker
        ? fromSignal('audio', speaker, 'notify', () => snapshot(speaker))
        : Stream.succeed(emptyState),
    ),
    Stream.tapError((error) => logFailure(error)),
    Stream.retry(reconnect),
  )
}
