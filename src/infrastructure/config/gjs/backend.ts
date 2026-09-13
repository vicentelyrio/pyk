import Gio from 'gi://Gio'
import { Effect, Layer, Stream } from 'effect'

import { attempt, fromSignal, logFailure, SourceError } from '@/infrastructure/effect'

import { configSpec, defaultConfig, merge, overrides, type ConfigPatch } from '../schema'
import { ConfigBackend } from '../store/backend'
import { configPath, load, save, type Loaded } from './file'

function report(loaded: Loaded): Effect.Effect<void> {
  if (!loaded.ok) {
    return logFailure(new SourceError({ domain: 'config', reason: `unreadable ${configPath}`, cause: loaded.reason }))
  }

  return Effect.forEach(loaded.issues, (issue) =>
    Effect.logWarning(`ignored ${issue}`).pipe(Effect.annotateLogs({ domain: 'config' })),
  ).pipe(Effect.asVoid)
}

export const ConfigBackendLive = Layer.effect(
  ConfigBackend,
  Effect.gen(function* () {
    const first = load()
    yield* report(first)

    const monitor = Gio.File.new_for_path(configPath).monitor_file(Gio.FileMonitorFlags.WATCH_MOVES, null)
    yield* Effect.addFinalizer(() => Effect.sync(() => monitor.cancel()))

    const current = () => {
      const loaded = load()
      return loaded.ok ? loaded.config : defaultConfig
    }

    return {
      path: configPath,
      initial: first.ok ? first.config : defaultConfig,
      changes: fromSignal('config', monitor, 'changed', load).pipe(
        Stream.tap(report),
        Stream.filter((loaded) => loaded.ok),
        Stream.map((loaded) => loaded.config),
      ),
      write: (patch: ConfigPatch) =>
        attempt('config', 'write', () => {
          save(overrides(configSpec, merge(current(), patch)))
        }),
      reset: attempt('config', 'reset', () => {
        save({})
      }),
    }
  }),
)
