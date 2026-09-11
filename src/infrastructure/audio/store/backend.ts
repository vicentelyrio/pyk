import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { AudioState } from './state'

export class AudioBackend extends Context.Service<AudioBackend, {
  readonly changes: Stream.Stream<AudioState, SourceError>
  readonly setVolume: (volume: number) => Effect.Effect<void, ActionError>
  readonly toggleMute: Effect.Effect<void, ActionError>
}>()('pyk/AudioBackend') {}
