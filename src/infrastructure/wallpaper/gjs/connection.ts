import Gio from 'gi://Gio'
import { Duration, Effect, Stream } from 'effect'

import { attemptPromise, fromSignal, reconnecting, report, type SourceError } from '@/infrastructure/effect'

import type { WallpaperImage, WallpaperState } from '../store/state'
import { scan, type Scanned } from './scan'
import { createThumbnail } from './thumbnail'

function watch(directory: string): Stream.Stream<readonly Scanned[], SourceError> {
  return Stream.unwrap(
    Effect.sync(() => {
      const monitor = Gio.File.new_for_path(directory).monitor_directory(Gio.FileMonitorFlags.WATCH_MOVES, null)
      return fromSignal('wallpaper', monitor, 'changed', () => scan(directory)).pipe(
        Stream.debounce(Duration.millis(250)),
      )
    }),
  )
}

function withThumbnails(directory: string, scanned: readonly Scanned[]): Stream.Stream<WallpaperState> {
  const initial: readonly WallpaperImage[] = scanned.map((it) => it.image)
  const missing = scanned.filter((it) => !it.image.thumbnail)

  const updates = Stream.fromIterable(missing).pipe(
    Stream.mapEffect(
      ({ image, target }) =>
        attemptPromise('wallpaper', 'thumbnail', () => createThumbnail(image.path, target), Duration.seconds(30)).pipe(
          Effect.map((thumbnail) => ({ path: image.path, thumbnail })),
          Effect.catchCause((cause) => report(cause).pipe(Effect.as(null))),
        ),
      { concurrency: 2 },
    ),
    Stream.scan(
      initial,
      (images, done) => (done ? images.map((it) => (it.path === done.path ? { ...it, thumbnail: done.thumbnail } : it)) : images),
    ),
    Stream.drop(1),
  )

  return Stream.concat(Stream.succeed(initial), updates).pipe(
    Stream.map((images) => ({ directory, images })),
  )
}

export function stateChanges(directories: Stream.Stream<string>): Stream.Stream<WallpaperState, SourceError> {
  return directories.pipe(
    Stream.changes,
    Stream.switchMap((directory) =>
      watch(directory).pipe(Stream.switchMap((scanned) => withThumbnails(directory, scanned))),
    ),
    reconnecting,
  )
}
