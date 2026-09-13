import Gio from 'gi://Gio'
import { Duration, Effect, Stream } from 'effect'

import { fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import type { ScheduleState } from '../store/state'
import { calendarsIn, parseCalendars, type Window } from './calendars'

function watchers(directory: string): Stream.Stream<void, SourceError> {
  return Stream.unwrap(
    Effect.sync(() => {
      const paths = [directory, ...calendarsIn(directory).map((it) => it.path).filter((it) => it !== directory)]
      const monitors = paths.map((path) =>
        Gio.File.new_for_path(path).monitor_directory(Gio.FileMonitorFlags.WATCH_MOVES, null))

      return Stream.mergeAll(
        monitors.map((monitor) => fromSignal('schedule', monitor, 'changed', () => undefined)),
        { concurrency: 'unbounded' },
      )
    }),
  )
}

export function stateChanges(
  inputs: Stream.Stream<{ readonly directory: string, readonly window: Window }>,
): Stream.Stream<ScheduleState, SourceError> {
  return inputs.pipe(
    Stream.switchMap(({ directory, window }) =>
      watchers(directory).pipe(
        Stream.debounce(Duration.millis(300)),
        Stream.mapEffect(() =>
          Effect.suspend(() => {
            const parsed = parseCalendars(directory, window)
            return Effect.forEach(parsed.issues, (issue) => Effect.logWarning(`skipped ${issue}`)).pipe(
              Effect.as({ directory, calendars: parsed.calendars.map((it) => it.name), events: parsed.events }),
              Effect.annotateLogs({ domain: 'schedule' }),
            )
          })),
      ),
    ),
    reconnecting,
  )
}
