import { Accessor, createMemo } from 'ags'
import { Equal } from 'effect'

import type { Config } from '../schema'

export function sections(state: Accessor<Config>) {
  return {
    appearance: createMemo(() => state().appearance, { equals: Equal.equals }),
    notifications: createMemo(() => state().notifications, { equals: Equal.equals }),
    popover: createMemo(() => state().popover, { equals: Equal.equals }),
    media: createMemo(() => state().media, { equals: Equal.equals }),
    system: createMemo(() => state().system, { equals: Equal.equals }),
  }
}
