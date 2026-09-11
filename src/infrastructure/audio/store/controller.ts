import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import { AudioBackend } from './backend'
import { emptyState, type AudioState } from './state'

export class Audio extends Context.Service<Audio, {
  readonly changes: Stream.Stream<AudioState>
  readonly snapshot: Effect.Effect<AudioState>
  readonly setVolume: (volume: number) => Effect.Effect<void, ActionError>
  readonly toggleMute: Effect.Effect<void, ActionError>
}>()('pyk/Audio') {}

export const AudioLayer = Layer.effect(
  Audio,
  Effect.gen(function* () {
    const backend = yield* AudioBackend
    const store = yield* makeStore('audio', emptyState, backend.changes)

    return {
      ...store,
      setVolume: backend.setVolume,
      toggleMute: backend.toggleMute,
    }
  }),
)
