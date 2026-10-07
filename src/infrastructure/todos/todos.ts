import { createMemo } from 'ags'
import { Equal } from 'effect'

import { add, toggle } from './actions'
import { todosState } from './bridge'

export const todos = {
  file: createMemo(() => todosState().file),
  items: createMemo(() => todosState().items, { equals: Equal.equals }),
  add,
  toggle,
} as const
