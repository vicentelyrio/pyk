import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import { Duration, Effect, Layer } from 'effect'

import { ActionError, attempt } from '@/infrastructure/effect'

import { Files } from '../store/backend'
import type { FileHit } from '../store/state'

const CANDIDATES = 200
const TIMEOUT = Duration.seconds(3)
const EXCLUDES = ['node_modules', '.git']

const home = GLib.get_home_dir()

function iconFor(name: string, isDirectory: boolean): string {
  if (isDirectory) return 'folder'
  const [type] = Gio.content_type_guess(name, null)
  return Gio.content_type_get_generic_icon_name(type) ?? 'text-x-generic'
}

function toHit(line: string): FileHit {
  const isDirectory = line.endsWith('/')
  const path = isDirectory ? line.slice(0, -1) : line

  const name = GLib.path_get_basename(path)

  return {
    path,
    name,
    parent: GLib.path_get_dirname(path),
    isDirectory,
    iconName: iconFor(name, isDirectory),
  }
}

function run(argv: readonly string[]): Effect.Effect<string, ActionError> {
  return Effect.callback<string, ActionError>((resume) => {
    const cancellable = new Gio.Cancellable()
    let proc: Gio.Subprocess

    try {
      proc = Gio.Subprocess.new([...argv], Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE)
    }
    catch (cause) {
      resume(Effect.fail(new ActionError({ domain: 'files', action: 'search', cause })))
      return
    }

    proc.communicate_utf8_async(null, cancellable, (_proc, result) => {
      try {
        const [, stdout] = proc.communicate_utf8_finish(result)
        resume(Effect.succeed(stdout ?? ''))
      }
      catch (cause) {
        resume(Effect.fail(new ActionError({ domain: 'files', action: 'search', cause })))
      }
    })

    return Effect.sync(() => {
      cancellable.cancel()
      proc.force_exit()
    })
  })
}

export const FilesLive = Layer.succeed(Files, {
  search: (query: string) =>
    run([
      'fd',
      '--fixed-strings',
      '--color', 'never',
      '--max-results', String(CANDIDATES),
      ...EXCLUDES.flatMap((it) => ['--exclude', it]),
      '--',
      query,
      home,
    ]).pipe(
      Effect.timeout(TIMEOUT),
      Effect.catchTag('TimeoutError', () =>
        Effect.fail(new ActionError({ domain: 'files', action: 'search', cause: 'timeout' }))),
      Effect.map((stdout) => stdout.split('\n').filter(Boolean).map(toHit)),
      Effect.withSpan('files.search'),
    ),
  open: (path: string) =>
    attempt('files', 'open', () => {
      Gio.AppInfo.launch_default_for_uri(Gio.File.new_for_path(path).get_uri(), null)
    }),
})
