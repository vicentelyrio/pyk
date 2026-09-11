import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Effect, Layer, Logger, Stream } from 'effect'

import { SourceError } from '@/infrastructure/effect'

import { Niri, NiriLayer } from './controller'
import { NiriIpc } from './ipc'

const workspacesLine = JSON.stringify({
  WorkspacesChanged: {
    workspaces: [1, 2, 3].map((id) => ({
      id,
      idx: id,
      name: null,
      output: 'DP-1',
      is_urgent: false,
      is_active: id === 1,
      is_focused: id === 1,
      active_window_id: null,
    })),
  },
})

const focusLine = JSON.stringify({ WindowFocusChanged: { id: 42 } })

function fakeIpc(script: (attempt: number) => Stream.Stream<string, SourceError>) {
  const sent: string[][] = []
  let attempts = 0

  const layer = Layer.succeed(NiriIpc, {
    events: Stream.unwrap(Effect.sync(() => script(++attempts))),
    send: (_action: string, args: ReadonlyArray<string>) =>
      Effect.sync(() => {
        sent.push([...args])
      }),
  })

  return { layer, sent, attempts: () => attempts }
}

const run = <A, E>(effect: Effect.Effect<A, E, Niri>, ipc: Layer.Layer<NiriIpc>) =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(
        NiriLayer.pipe(Layer.provide([ipc]), Layer.provideMerge([Logger.layer([])])),
      ),
      Effect.scoped,
    ),
  )

describe('Niri', () => {
  test('keeps reduced state across a source failure and reconnect', async () => {
    const ipc = fakeIpc((attempt) =>
      attempt === 1
        ? Stream.fromIterable([workspacesLine]).pipe(
            Stream.concat(Stream.fail(new SourceError({ domain: 'niri', reason: 'dropped' }))),
          )
        : Stream.fromIterable([focusLine]).pipe(Stream.concat(Stream.never)),
    )

    const state = await run(
      Effect.gen(function* () {
        const niri = yield* Niri
        yield* Effect.sleep('2 seconds')
        return yield* niri.snapshot
      }),
      ipc.layer,
    )

    assert.ok(ipc.attempts() > 1, 'the source should have been retried')
    assert.equal(state.workspaces.length, 3, 'workspaces must survive the reconnect')
    assert.equal(state.focusedWindowId, 42, 'post-reconnect events must still apply')
  })

  test('reduces events from the transport into state', async () => {
    const ipc = fakeIpc(() =>
      Stream.fromIterable([workspacesLine, focusLine]).pipe(Stream.concat(Stream.never)),
    )

    const state = await run(
      Effect.gen(function* () {
        const niri = yield* Niri
        yield* Effect.sleep('200 millis')
        return yield* niri.snapshot
      }),
      ipc.layer,
    )

    assert.equal(state.workspaces.length, 3)
    assert.equal(state.focusedWorkspaceId, 1)
    assert.equal(state.focusedWindowId, 42)
  })

  test('routes actions through the transport', async () => {
    const ipc = fakeIpc(() => Stream.never)

    await run(
      Effect.gen(function* () {
        const niri = yield* Niri
        yield* niri.focusWorkspace(2)
        yield* niri.action('focus-column-left')
      }),
      ipc.layer,
    )

    assert.deepEqual(ipc.sent, [
      ['action', 'focus-workspace', '2'],
      ['action', 'focus-column-left'],
    ])
  })
})
