import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import Soup from 'gi://Soup?version=3.0'
import { Effect, PubSub, type Scope, Stream } from 'effect'

import { report, SourceError } from '@/infrastructure/effect'

import { fillTemplate, localPath, matchRule, type ChannelRule } from '../derived/channel'
import type { MprisState } from '../store/state'

const TIMEOUT_SECONDS = 20

const coverDir = GLib.build_filenamev([GLib.get_user_cache_dir(), 'pyk', 'mpris', 'covers'])

export interface ChannelSettings {
  readonly channels: readonly ChannelRule[]
  readonly localCovers: readonly string[]
}

export interface ChannelResolver {
  readonly apply: (state: MprisState) => Effect.Effect<MprisState>
  readonly fetched: Stream.Stream<void>
}

function cachePath(url: string): string {
  return GLib.build_filenamev([coverDir, GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, url, -1) ?? url])
}

function exists(path: string): boolean {
  return GLib.file_test(path, GLib.FileTest.IS_REGULAR)
}

function localCover(url: string, names: readonly string[]): string | null {
  const file = localPath(url)
  if (!file) return null

  const dir = GLib.path_get_dirname(file)
  return names.map((name) => GLib.build_filenamev([dir, name])).find(exists) ?? null
}

function download(session: Soup.Session, url: string): Effect.Effect<void, SourceError> {
  const fail = (cause: unknown) => Effect.fail(new SourceError({ domain: 'mpris', reason: `GET ${url}`, cause }))

  return Effect.callback<void, SourceError>((resume) => {
    const message = Soup.Message.new('GET', url)
    if (!message) return resume(fail('invalid url'))

    const cancellable = new Gio.Cancellable()

    session.send_and_read_async(message, GLib.PRIORITY_LOW, cancellable, (_session, result) => {
      try {
        const bytes = session.send_and_read_finish(result)
        const status = message.get_status()
        if (status !== Soup.Status.OK) return resume(fail(`HTTP ${status}`))

        const type = message.get_response_headers().get_content_type()[0] ?? ''
        if (!type.startsWith('image/')) return resume(fail(`not an image: ${type}`))

        GLib.mkdir_with_parents(coverDir, 0o755)
        const file = Gio.File.new_for_path(cachePath(url))

        file.replace_contents_bytes_async(bytes, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, cancellable, (_file, written) => {
          try {
            file.replace_contents_finish(written)
            resume(Effect.void)
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

export function channelResolver(settings: ChannelSettings): Effect.Effect<ChannelResolver, never, Scope.Scope> {
  return Effect.gen(function* () {
    const scope = yield* Effect.scope
    const fetched = yield* PubSub.unbounded<void>()
    const session = new Soup.Session({ timeout: TIMEOUT_SECONDS, user_agent: 'pyk' })
    const attempted = new Set<string>()

    const fetch = (url: string) =>
      download(session, url).pipe(
        Effect.andThen(PubSub.publish(fetched, undefined)),
        Effect.catchCause(report),
        Effect.forkIn(scope),
      )

    const apply = (state: MprisState): Effect.Effect<MprisState> => {
      if (!state.hasPlayer) return Effect.succeed(state)

      const rule = matchRule(settings.channels, state.channel)
      const named = rule?.name ? { ...state, channel: { ...state.channel, name: rule.name } } : state
      if (named.coverArt) return Effect.succeed(named)

      const local = localCover(named.url, settings.localCovers)
      if (local) return Effect.succeed({ ...named, coverArt: local })

      const remote = rule?.cover ? fillTemplate(rule.cover, named) : null
      if (!remote) return Effect.succeed(named)

      const path = cachePath(remote)
      if (exists(path)) return Effect.succeed({ ...named, coverArt: path })
      if (attempted.has(remote)) return Effect.succeed(named)

      attempted.add(remote)
      return fetch(remote).pipe(Effect.as(named))
    }

    return { apply, fetched: Stream.fromPubSub(fetched) }
  })
}
