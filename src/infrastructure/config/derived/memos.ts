import { Accessor, createMemo } from 'ags'
import { Equal } from 'effect'

import type { Config } from '../schema'

export function sections(state: Accessor<Config>) {
  return {
    appearance: createMemo(() => state().appearance, { equals: Equal.equals }),
    notifications: createMemo(() => state().notifications, { equals: Equal.equals }),
    brightness: createMemo(() => state().brightness, { equals: Equal.equals }),
    osd: createMemo(() => state().osd, { equals: Equal.equals }),
    popover: createMemo(() => state().popover, { equals: Equal.equals }),
    launcher: createMemo(() => state().launcher, { equals: Equal.equals }),
    shortcuts: createMemo(() => state().shortcuts, { equals: Equal.equals }),
    wallpaper: createMemo(() => state().wallpaper, { equals: Equal.equals }),
    clock: createMemo(() => state().clock, { equals: Equal.equals }),
    calendar: createMemo(() => state().calendar, { equals: Equal.equals }),
    schedule: createMemo(() => state().schedule, { equals: Equal.equals }),
    widgets: createMemo(() => state().widgets, { equals: Equal.equals }),
    weather: createMemo(() => state().weather, { equals: Equal.equals }),
    todos: createMemo(() => state().todos, { equals: Equal.equals }),
    monitor: createMemo(() => state().monitor, { equals: Equal.equals }),
    media: createMemo(() => state().media, { equals: Equal.equals }),
    system: createMemo(() => state().system, { equals: Equal.equals }),
  }
}
