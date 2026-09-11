import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Duration, Effect, Layer, Logger, Stream } from 'effect'

import { SourceError } from '@/infrastructure/effect'

import { NetworkBackend } from './backend'
import { Network, NetworkLayer } from './controller'
import { emptyState, type NetworkState } from './state'

const wifi = (over: Partial<NetworkState> = {}): NetworkState => ({
  kind: 'wifi',
  icon: 'network-wireless-signal-ok-symbolic',
  ssid: 'Lyrio',
  strength: 45,
  isConnected: true,
  isConnecting: false,
  wifiEnabled: true,
  ...over,
})

function fakeBackend(changes: Stream.Stream<NetworkState, SourceError>) {
  const calls: string[] = []

  const layer = Layer.succeed(NetworkBackend, {
    changes,
    toggleWifi: Effect.sync(() => { calls.push('toggleWifi') }),
  })

  return { layer, calls }
}

const run = <A, E>(effect: Effect.Effect<A, E, Network>, backend: Layer.Layer<NetworkBackend>) =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(
        NetworkLayer.pipe(Layer.provide([backend]), Layer.provideMerge([Logger.layer([])])),
      ),
      Effect.scoped,
    ),
  )

const snapshotAfter = (
  backend: Layer.Layer<NetworkBackend>,
  wait: Duration.Input = '200 millis',
) =>
  run(
    Effect.gen(function* () {
      const network = yield* Network
      yield* Effect.sleep(wait)
      return yield* network.snapshot
    }),
    backend,
  )

describe('Network', () => {
  test('exposes the latest snapshot from the backend', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([wifi(), wifi({ strength: 80, icon: 'network-wireless-signal-excellent-symbolic' })])
        .pipe(Stream.concat(Stream.never)),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.strength, 80)
    assert.equal(state.icon, 'network-wireless-signal-excellent-symbolic')
    assert.equal(state.ssid, 'Lyrio')
  })

  test('starts disconnected before the backend emits', async () => {
    const state = await run(
      Effect.gen(function* () {
        const network = yield* Network
        return yield* network.snapshot
      }),
      fakeBackend(Stream.never).layer,
    )

    assert.deepEqual(state, emptyState)
    assert.equal(state.kind, 'none')
  })

  test('carries a wired connection through unchanged', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([
        wifi({ kind: 'wired', ssid: '', strength: 0, icon: 'network-wired-symbolic' }),
      ]).pipe(Stream.concat(Stream.never)),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.kind, 'wired')
    assert.equal(state.ssid, '')
    assert.equal(state.isConnected, true)
  })

  test('routes toggleWifi to the backend', async () => {
    const backend = fakeBackend(Stream.never)

    await run(
      Effect.gen(function* () {
        const network = yield* Network
        yield* network.toggleWifi
      }),
      backend.layer,
    )

    assert.deepEqual(backend.calls, ['toggleWifi'])
  })

  test('keeps the last state when the source fails terminally', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([wifi({ strength: 62 })]).pipe(
        Stream.concat(Stream.fail(new SourceError({ domain: 'network', reason: 'NM vanished' }))),
      ),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.strength, 62, 'state should freeze at the last good value')
    assert.equal(state.kind, 'wifi')
  })
})
