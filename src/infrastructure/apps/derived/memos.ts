import { Accessor, createMemo } from 'ags'
import { Equal } from 'effect'

import type { AppsState } from '../store/state'

export function catalog(state: Accessor<AppsState>) {
  return {
    apps: createMemo(() => state().apps, { equals: Equal.equals }),
    count: createMemo(() => state().apps.length),
  }
}
