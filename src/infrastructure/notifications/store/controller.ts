import { Context, Effect, Layer, Stream } from 'effect'

import { type ActionError, makeStore } from '@/infrastructure/effect'

import { NotificationsBackend } from './backend'
import { emptyState, type NotificationsState } from './state'

export class Notifications extends Context.Service<Notifications, {
  readonly changes: Stream.Stream<NotificationsState>
  readonly snapshot: Effect.Effect<NotificationsState>
  readonly dismiss: (id: number) => Effect.Effect<void, ActionError>
  readonly dismissAll: Effect.Effect<void, ActionError>
  readonly invoke: (id: number, action: string) => Effect.Effect<void, ActionError>
  readonly toggleDontDisturb: Effect.Effect<void, ActionError>
}>()('pyk/Notifications') {}

export const NotificationsLayer = Layer.effect(
  Notifications,
  Effect.gen(function* () {
    const backend = yield* NotificationsBackend
    const store = yield* makeStore('notifications', emptyState, backend.changes)

    return {
      ...store,
      dismiss: backend.dismiss,
      dismissAll: backend.dismissAll,
      invoke: backend.invoke,
      toggleDontDisturb: backend.toggleDontDisturb,
    }
  }),
)
