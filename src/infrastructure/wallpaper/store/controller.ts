import { Context, Effect, Layer, Stream } from 'effect'

import { Configuration } from '@/infrastructure/config/store/controller'
import { type ActionError, makeStore } from '@/infrastructure/effect'

import { WallpaperBackend } from './backend'
import { emptyState, type WallpaperState } from './state'

export class Wallpaper extends Context.Service<Wallpaper, {
  readonly changes: Stream.Stream<WallpaperState>
  readonly snapshot: Effect.Effect<WallpaperState>
  readonly assign: (connector: string, path: string) => Effect.Effect<void, ActionError>
}>()('pyk/Wallpaper') {}

export const WallpaperLayer = Layer.effect(
  Wallpaper,
  Effect.gen(function* () {
    const backend = yield* WallpaperBackend
    const configuration = yield* Configuration
    const store = yield* makeStore('wallpaper', emptyState, backend.changes)

    return {
      ...store,
      assign: (connector: string, path: string) =>
        configuration.write({ wallpaper: connector ? { outputs: { [connector]: path } } : { image: path } }),
    }
  }),
)
