import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import Soup from 'gi://Soup?version=3.0'
import { Duration, Effect, Stream } from 'effect'

import { attemptPromise, report, SourceError } from '@/infrastructure/effect'

import { displayName, downloadUrl } from '../derived/remote'
import { emptyRemote, type WallpaperRemote } from '../store/state'
import { inspect, type Scanned } from './scan'
import { createThumbnail } from './thumbnail'

const TIMEOUT_SECONDS = 60

const remoteDir = GLib.build_filenamev([GLib.get_user_cache_dir(), 'pyk', 'wallpapers', 'remote'])

const session = new Soup.Session({ timeout: TIMEOUT_SECONDS, user_agent: 'pyk' })

function cachePath(url: string): string {
  return GLib.build_filenamev([remoteDir, GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, url, -1) ?? url])
}

function cached(url: string): boolean {
  return GLib.file_test(cachePath(url), GLib.FileTest.EXISTS)
}

function download(url: string): Effect.Effect<string, SourceError> {
  const fail = (cause: unknown) => Effect.fail(new SourceError({ domain: 'wallpaper', reason: `GET ${url}`, cause }))

  return Effect.callback<string, SourceError>((resume) => {
    const message = Soup.Message.new('GET', downloadUrl(url))
    if (!message) return resume(fail('invalid url'))

    const cancellable = new Gio.Cancellable()
    const target = cachePath(url)

    session.send_and_read_async(message, GLib.PRIORITY_LOW, cancellable, (_session, result) => {
      try {
        const bytes = session.send_and_read_finish(result)
        const status = message.get_status()
        if (status !== Soup.Status.OK) return resume(fail(`HTTP ${status}`))

        const type = message.get_response_headers().get_content_type()[0] ?? ''
        if (!type.startsWith('image/')) return resume(fail(`not an image: ${type}`))

        GLib.mkdir_with_parents(remoteDir, 0o755)
        const file = Gio.File.new_for_path(target)

        file.replace_contents_bytes_async(bytes, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, cancellable, (_file, written) => {
          try {
            file.replace_contents_finish(written)
            resume(Effect.succeed(target))
          }
          catch (cause) {
            resume(fail(cause))
          }
        })
      }
      catch (cause) {
        resume(fail(cause))
      }
    })

    return Effect.sync(() => cancellable.cancel())
  })
}

function resolve(url: string): Effect.Effect<Scanned | null> {
  const fetched = cached(url) ? Effect.succeed(cachePath(url)) : download(url)

  return fetched.pipe(
    Effect.map((file) => inspect(file, url, displayName(url), 0)),
    Effect.flatMap((scanned) =>
      scanned && !scanned.image.thumbnail
        ? attemptPromise('wallpaper', 'thumbnail', () => createThumbnail(scanned.source, scanned.target), Duration.seconds(30)).pipe(
            Effect.map((thumbnail) => ({ ...scanned, image: { ...scanned.image, thumbnail } })),
          )
        : Effect.succeed(scanned)),
    Effect.catchCause((cause) => report(cause).pipe(Effect.as(null))),
  )
}

export function remoteChanges(urls: readonly string[]): Stream.Stream<WallpaperRemote> {
  return Stream.fromIterable(urls).pipe(
    Stream.mapEffect(resolve, { concurrency: 2 }),
    Stream.scan(emptyRemote, (state, scanned): WallpaperRemote =>
      scanned
        ? { remote: [...state.remote, scanned.image], files: { ...state.files, [scanned.image.path]: scanned.source } }
        : state),
  )
}
