import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Duration, Effect, Layer, Logger, Stream } from 'effect'

import { SourceError } from '@/infrastructure/effect'

import { BluetoothBackend } from './backend'
import { Bluetooth, BluetoothLayer } from './controller'
import { emptyState, type BluetoothDevice, type BluetoothState } from './state'

const device = (over: Partial<BluetoothDevice> = {}): BluetoothDevice => ({
  address: 'AA:BB:CC:DD:EE:FF',
  name: 'Headphones',
  icon: 'audio-headset-symbolic',
  isConnected: true,
  isConnecting: false,
  battery: 0.8,
  ...over,
})

const powered = (over: Partial<BluetoothState> = {}): BluetoothState => ({
  hasAdapter: true,
  isPowered: true,
  isConnected: true,
  devices: [device()],
  ...over,
})

function fakeBackend(changes: Stream.Stream<BluetoothState, SourceError>) {
  const calls: string[] = []

  const layer = Layer.succeed(BluetoothBackend, {
    changes,
    togglePower: Effect.sync(() => { calls.push('togglePower') }),
    toggleDevice: (address: string) => Effect.sync(() => { calls.push(`toggleDevice:${address}`) }),
  })

  return { layer, calls }
}

const run = <A, E>(effect: Effect.Effect<A, E, Bluetooth>, backend: Layer.Layer<BluetoothBackend>) =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(
        BluetoothLayer.pipe(Layer.provide([backend]), Layer.provideMerge([Logger.layer([])])),
      ),
      Effect.scoped,
    ),
  )

const snapshotAfter = (
  backend: Layer.Layer<BluetoothBackend>,
  wait: Duration.Input = '200 millis',
) =>
  run(
    Effect.gen(function* () {
      const bluetooth = yield* Bluetooth
      yield* Effect.sleep(wait)
      return yield* bluetooth.snapshot
    }),
    backend,
  )

describe('Bluetooth', () => {
  test('exposes the latest snapshot from the backend', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([
        powered(),
        powered({ devices: [device({ isConnected: false }), device({ address: 'BB', name: 'Mouse' })] }),
      ]).pipe(Stream.concat(Stream.never)),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.devices.length, 2)
    assert.equal(state.devices[0].isConnected, false)
    assert.equal(state.devices[1].name, 'Mouse')
  })

  test('starts with no adapter before the backend emits', async () => {
    const state = await run(
      Effect.gen(function* () {
        const bluetooth = yield* Bluetooth
        return yield* bluetooth.snapshot
      }),
      fakeBackend(Stream.never).layer,
    )

    assert.deepEqual(state, emptyState)
    assert.equal(state.hasAdapter, false)
  })

  test('carries a powered adapter with no paired devices', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([powered({ isConnected: false, devices: [] })])
        .pipe(Stream.concat(Stream.never)),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.isPowered, true)
    assert.deepEqual(state.devices, [])
  })

  test('routes both actions to the backend', async () => {
    const backend = fakeBackend(Stream.never)

    await run(
      Effect.gen(function* () {
        const bluetooth = yield* Bluetooth
        yield* bluetooth.togglePower
        yield* bluetooth.toggleDevice('AA:BB:CC:DD:EE:FF')
      }),
      backend.layer,
    )

    assert.deepEqual(backend.calls, ['togglePower', 'toggleDevice:AA:BB:CC:DD:EE:FF'])
  })

  test('keeps the last state when the source fails terminally', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([powered()]).pipe(
        Stream.concat(Stream.fail(new SourceError({ domain: 'bluetooth', reason: 'bluez gone' }))),
      ),
    )

    const state = await snapshotAfter(backend.layer)

    assert.equal(state.isPowered, true, 'state should freeze at the last good value')
    assert.equal(state.devices.length, 1)
  })
})
