import GLib from 'gi://GLib'
import { Effect, Layer, Stream } from 'effect'

import { expandHome } from '@/infrastructure/config/schema'
import { Configuration } from '@/infrastructure/config/store/controller'

import { remoteSources } from '../derived/remote'
import { WallpaperBackend } from '../store/backend'
import { stateChanges } from './connection'
import { remoteChanges } from './remote'

export const WallpaperBackendLive = Layer.effect(
  WallpaperBackend,
  Effect.gen(function* () {
    const configuration = yield* Configuration
    const home = GLib.get_home_dir()

    const remote = configuration.changes.pipe(
      Stream.map((config) => remoteSources(config.wallpaper).join('\n')),
      Stream.changes,
      Stream.switchMap((key) => remoteChanges(key ? key.split('\n') : [])),
    )

    return {
      changes: stateChanges(
        configuration.changes.pipe(Stream.map((config) => expandHome(config.wallpaper.directory, home))),
      ).pipe(
        Stream.zipLatestWith(remote, (gallery, remote) => ({ ...gallery, ...remote })),
      ),
    }
  }),
)
