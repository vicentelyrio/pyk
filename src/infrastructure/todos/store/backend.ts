import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { TodosState } from './state'

export class TodosBackend extends Context.Service<TodosBackend, {
  readonly changes: Stream.Stream<TodosState, SourceError>
  readonly toggle: (line: number) => Effect.Effect<void, ActionError>
}>()('pyk/TodosBackend') {}
