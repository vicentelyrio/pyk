import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { NotificationsState } from './state'

export class NotificationsBackend extends Context.Service<NotificationsBackend, {
  readonly changes: Stream.Stream<NotificationsState, SourceError>
  readonly dismiss: (id: number) => Effect.Effect<void, ActionError>
  readonly dismissAll: Effect.Effect<void, ActionError>
  readonly invoke: (id: number, action: string) => Effect.Effect<void, ActionError>
  readonly toggleDontDisturb: Effect.Effect<void, ActionError>
}>()('pyk/NotificationsBackend') {}
