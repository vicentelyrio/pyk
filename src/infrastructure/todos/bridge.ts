import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { emptyState, Todos, type TodosState } from './store'

export const todosState: Accessor<TodosState> = createServiceAccessor(
  emptyState,
  Todos,
  (todos) => todos.changes,
)
