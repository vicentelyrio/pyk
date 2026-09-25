import { createMemo } from 'ags'
import { Equal } from 'effect'

import { toggle } from './actions'
import { todosState } from './bridge'

export const todos = {
  file: createMemo(() => todosState().file),
  items: createMemo(() => todosState().items, { equals: Equal.equals }),
  toggle,
} as const
