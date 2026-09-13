import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { Config, ConfigPatch } from '../schema'

export class ConfigBackend extends Context.Service<ConfigBackend, {
  readonly path: string
  readonly initial: Config
  readonly changes: Stream.Stream<Config, SourceError>
  readonly write: (patch: ConfigPatch) => Effect.Effect<void, ActionError>
  readonly reset: Effect.Effect<void, ActionError>
}>()('pyk/ConfigBackend') {}
