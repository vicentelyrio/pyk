import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { BrightnessState } from './state'

export class BrightnessBackend extends Context.Service<BrightnessBackend, {
  readonly changes: Stream.Stream<BrightnessState, SourceError>
  readonly setLevel: (level: number) => Effect.Effect<void, ActionError>
  readonly refresh: Effect.Effect<void, ActionError>
}>()('pyk/BrightnessBackend') {}
