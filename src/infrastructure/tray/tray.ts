import { createMemo } from 'ags'

import { aboutToShow, activate, secondaryActivate } from './actions'
import { trayState } from './bridge'

const items = createMemo(() => trayState().items)

export const tray = {
  items,
  ids: createMemo(() => items().map((it) => it.id), { equals: (a, b) => a.join('\n') === b.join('\n') }),
  hasItems: createMemo(() => items().length > 0),
  find: (id: string) => items().find((it) => it.id === id) ?? null,
  activate,
  secondaryActivate,
  aboutToShow,
} as const
