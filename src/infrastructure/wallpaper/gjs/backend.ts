import GLib from 'gi://GLib'
import { Effect, Layer, Stream } from 'effect'

import { expandHome } from '@/infrastructure/config/schema'
import { Configuration } from '@/infrastructure/config/store/controller'

import { WallpaperBackend } from '../store/backend'
import { stateChanges } from './connection'

export const WallpaperBackendLive = Layer.effect(
  WallpaperBackend,
  Effect.gen(function* () {
    const configuration = yield* Configuration
    const home = GLib.get_home_dir()

    return {
      changes: stateChanges(
        configuration.changes.pipe(Stream.map((config) => expandHome(config.wallpaper.directory, home))),
      ),
    }
  }),
)
