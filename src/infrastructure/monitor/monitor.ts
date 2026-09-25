import { createMemo } from 'ags'
import { Equal } from 'effect'

import { monitorState } from './bridge'
import { HISTORY } from './derived'

export const monitor = {
  meters: createMemo(() => monitorState().meters, { equals: Equal.equals }),
  capacity: HISTORY,
} as const
