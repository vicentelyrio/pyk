import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import { Duration, Effect, Layer, Stream } from 'effect'

import { expandHome } from '@/infrastructure/config/schema'
import { Configuration } from '@/infrastructure/config/store/controller'
import { attempt, fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import { appendLine, parseTodos, toggleLine } from '../derived'
import { TodosBackend } from '../store/backend'
import type { TodosState } from '../store/state'

function readText(path: string): string {
  if (!GLib.file_test(path, GLib.FileTest.EXISTS)) return ''
  const [, bytes] = GLib.file_get_contents(path)
  return new TextDecoder().decode(bytes)
}

function writeText(path: string, text: string): void {
  const parent = GLib.path_get_dirname(path)
  if (!GLib.file_test(parent, GLib.FileTest.IS_DIR)) GLib.mkdir_with_parents(parent, 0o755)
  GLib.file_set_contents(path, text)
}

function watch(file: string): Stream.Stream<TodosState, SourceError> {
  return Stream.unwrap(
    Effect.acquireRelease(
      Effect.sync(() => Gio.File.new_for_path(file).monitor_file(Gio.FileMonitorFlags.WATCH_MOVES, null)),
      (monitor) => Effect.sync(() => monitor.cancel()),
    ).pipe(
      Effect.map((monitor) =>
        fromSignal('todos', monitor, 'changed', () => ({ file, items: parseTodos(readText(file)) })).pipe(
          Stream.debounce(Duration.millis(100)),
        )),
    ),
  )
}

export const TodosBackendLive = Layer.effect(
  TodosBackend,
  Effect.gen(function* () {
    const configuration = yield* Configuration
    const home = GLib.get_home_dir()
    const resolve = (path: string) => expandHome(path, home)
    const edit = (action: string, change: (text: string) => string) =>
      Effect.flatMap(configuration.snapshot, (config) =>
        attempt('todos', action, () => {
          const file = resolve(config.todos.file)
          writeText(file, change(readText(file)))
        }))

    return {
      changes: configuration.changes.pipe(
        Stream.map((config) => resolve(config.todos.file)),
        Stream.changes,
        Stream.switchMap(watch),
        reconnecting,
      ),
      add: (text: string) => edit('add', (current) => appendLine(current, text)),
      toggle: (line: number) => edit('toggle', (current) => toggleLine(current, line)),
    }
  }),
)
