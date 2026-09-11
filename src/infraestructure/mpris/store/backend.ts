import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infraestructure/effect'

import type { MprisState } from './state'

export class MprisBackend extends Context.Service<MprisBackend, {
  readonly changes: Stream.Stream<MprisState, SourceError>
  readonly playPause: Effect.Effect<void, ActionError>
  readonly next: Effect.Effect<void, ActionError>
  readonly previous: Effect.Effect<void, ActionError>
}>()('pyk/MprisBackend') {}
