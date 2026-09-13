import AstalWp from 'gi://AstalWp'
import { Stream } from 'effect'

import { fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import { emptyState, type AudioState } from '../store/state'
import { defaultSpeaker, snapshot } from './speaker'

export function stateChanges(wp: AstalWp.Wp): Stream.Stream<AudioState, SourceError> {
  return fromSignal('audio', wp, 'notify::default-speaker', () => defaultSpeaker(wp)).pipe(
    Stream.switchMap((speaker) =>
      speaker
        ? fromSignal('audio', speaker, 'notify', () => snapshot(speaker))
        : Stream.succeed(emptyState),
    ),
    reconnecting,
  )
}
