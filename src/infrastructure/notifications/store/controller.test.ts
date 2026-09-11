import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Duration, Effect, Layer, Logger, Stream } from 'effect'

import { SourceError } from '@/infrastructure/effect'

import { NotificationsBackend } from './backend'
import { Notifications, NotificationsLayer } from './controller'
import { emptyState, type Notification, type NotificationsState } from './state'

const notification = (over: Partial<Notification> = {}): Notification => ({
  id: 1,
  appName: 'Signal',
  appIcon: 'signal-symbolic',
  summary: 'New message',
  body: 'hello',
  image: '',
  urgency: 'normal',
  time: 1000,
  actions: [{ id: 'default', label: 'Open' }],
  ...over,
})

const inbox = (over: Partial<NotificationsState> = {}): NotificationsState => ({
  notifications: [notification()],
  dontDisturb: false,
  ...over,
})

function fakeBackend(changes: Stream.Stream<NotificationsState, SourceError>) {
  const calls: string[] = []

  const layer = Layer.succeed(NotificationsBackend, {
    changes,
    dismiss: (id: number) => Effect.sync(() => { calls.push(`dismiss:${id}`) }),
    dismissAll: Effect.sync(() => { calls.push('dismissAll') }),
    invoke: (id: number, action: string) =>
      Effect.sync(() => { calls.push(`invoke:${id}:${action}`) }),
    toggleDontDisturb: Effect.sync(() => { calls.push('toggleDontDisturb') }),
  })

  return { layer, calls }
}

const run = <A, E>(
  effect: Effect.Effect<A, E, Notifications>,
  backend: Layer.Layer<NotificationsBackend>,
) =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(
        NotificationsLayer.pipe(Layer.provide([backend]), Layer.provideMerge([Logger.layer([])])),
      ),
      Effect.scoped,
    ),
  )

const snapshotAfter = (
  backend: Layer.Layer<NotificationsBackend>,
  wait: Duration.Input = '200 millis',
) =>
  run(
    Effect.gen(function* () {
      const notifications = yield* Notifications
      yield* Effect.sleep(wait)
      return yield* notifications.snapshot
    }),
    backend,
  )

describe('Notifications', () => {
  test('exposes the latest inbox from the backend', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([
        inbox(),
        inbox({ notifications: [notification({ id: 2, summary: 'Later', time: 2000 }), notification()] }),
      ]).pipe(Stream.concat(Stream.never)),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.notifications.length, 2)
    assert.equal(state.notifications[0].summary, 'Later')
    assert.deepEqual(state.notifications[0].actions, [{ id: 'default', label: 'Open' }])
  })

  test('starts empty before the backend emits', async () => {
    const state = await run(
      Effect.gen(function* () {
        const notifications = yield* Notifications
        return yield* notifications.snapshot
      }),
      fakeBackend(Stream.never).layer,
    )

    assert.deepEqual(state, emptyState)
    assert.equal(state.notifications.length, 0)
  })

  test('carries do-not-disturb through', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([inbox({ dontDisturb: true })]).pipe(Stream.concat(Stream.never)),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.dontDisturb, true)
  })

  test('routes every action to the backend', async () => {
    const backend = fakeBackend(Stream.never)

    await run(
      Effect.gen(function* () {
        const notifications = yield* Notifications
        yield* notifications.dismiss(7)
        yield* notifications.invoke(7, 'default')
        yield* notifications.dismissAll
        yield* notifications.toggleDontDisturb
      }),
      backend.layer,
    )

    assert.deepEqual(backend.calls, [
      'dismiss:7',
      'invoke:7:default',
      'dismissAll',
      'toggleDontDisturb',
    ])
  })

  test('keeps the last inbox when the source fails terminally', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([inbox()]).pipe(
        Stream.concat(Stream.fail(new SourceError({ domain: 'notifications', reason: 'notifd gone' }))),
      ),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.notifications.length, 1, 'inbox should freeze, not clear')
  })
})
