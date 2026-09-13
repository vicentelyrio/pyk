import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import type { Config, ConfigPatch } from '../schema'
import { ConfigBackend } from './backend'
import { StartupConfig } from './references'

export class Configuration extends Context.Service<Configuration, {
  readonly path: string
  readonly changes: Stream.Stream<Config>
  readonly snapshot: Effect.Effect<Config>
  readonly write: (patch: ConfigPatch) => Effect.Effect<void, ActionError>
  readonly reset: Effect.Effect<void, ActionError>
}>()('pyk/Configuration') {}

export const ConfigurationLayer = Layer.effect(
  Configuration,
  Effect.gen(function* () {
    const backend = yield* ConfigBackend
    const store = yield* makeStore('config', backend.initial, backend.changes)

    return {
      ...store,
      path: backend.path,
      write: backend.write,
      reset: backend.reset,
    }
  }),
)

export const StartupConfigLayer = Layer.effect(
  StartupConfig,
  Effect.map(ConfigBackend, (backend) => backend.initial),
)
