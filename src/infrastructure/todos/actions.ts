import { dispatch } from '@/infrastructure/runtime'

import { Todos } from './store'

export function toggle(line: number): void {
  dispatch(Todos, (todos) => todos.toggle(line))
}
