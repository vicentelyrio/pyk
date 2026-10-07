import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import { TodosBackend } from './backend'
import { emptyState, type TodosState } from './state'

export class Todos extends Context.Service<Todos, {
  readonly changes: Stream.Stream<TodosState>
  readonly snapshot: Effect.Effect<TodosState>
  readonly add: (text: string) => Effect.Effect<void, ActionError>
  readonly toggle: (line: number) => Effect.Effect<void, ActionError>
}>()('pyk/Todos') {}

export const TodosLayer = Layer.effect(
  Todos,
  Effect.gen(function* () {
    const backend = yield* TodosBackend
    const store = yield* makeStore('todos', emptyState, backend.changes)

    return {
      ...store,
      add: backend.add,
      toggle: backend.toggle,
    }
  }),
)
