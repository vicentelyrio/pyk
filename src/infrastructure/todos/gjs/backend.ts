import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import { Duration, Effect, Layer, Stream } from 'effect'

import { expandHome } from '@/infrastructure/config/schema'
import { Configuration } from '@/infrastructure/config/store/controller'
import { attempt, fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import { parseTodos, toggleLine } from '../derived'
import { TodosBackend } from '../store/backend'
import type { TodosState } from '../store/state'

function readText(path: string): string {
  if (!GLib.file_test(path, GLib.FileTest.EXISTS)) return ''
  const [, bytes] = GLib.file_get_contents(path)
  return new TextDecoder().decode(bytes)
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

    return {
      changes: configuration.changes.pipe(
        Stream.map((config) => resolve(config.todos.file)),
        Stream.changes,
        Stream.switchMap(watch),
        reconnecting,
      ),
      toggle: (line: number) =>
        Effect.flatMap(configuration.snapshot, (config) =>
          attempt('todos', 'toggle', () => {
            const file = resolve(config.todos.file)
            GLib.file_set_contents(file, toggleLine(readText(file), line))
          })),
    }
  }),
)
