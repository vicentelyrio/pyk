import { dispatch } from '@/infrastructure/runtime'

import { Todos } from './store'

export function add(text: string): void {
  dispatch(Todos, (todos) => todos.add(text))
}

export function toggle(line: number): void {
  dispatch(Todos, (todos) => todos.toggle(line))
}
