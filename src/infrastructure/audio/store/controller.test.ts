import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Effect, Layer, Logger, Stream } from 'effect'

import { SourceError } from '@/infrastructure/effect'

import { AudioBackend } from './backend'
import { Audio, AudioLayer } from './controller'
import { emptyState, type AudioState } from './state'

const speaker = (over: Partial<AudioState> = {}): AudioState => ({
  hasSpeaker: true,
  volume: 0.4,
  isMuted: false,
  icon: 'audio-volume-medium-symbolic',
  description: 'Built-in Audio',
  ...over,
})

function fakeBackend(changes: Stream.Stream<AudioState, SourceError>) {
  const calls: string[] = []

  const layer = Layer.succeed(AudioBackend, {
    changes,
    setVolume: (volume: number) => Effect.sync(() => { calls.push(`setVolume:${volume}`) }),
    toggleMute: Effect.sync(() => { calls.push('toggleMute') }),
  })

  return { layer, calls }
}

const run = <A, E>(effect: Effect.Effect<A, E, Audio>, backend: Layer.Layer<AudioBackend>) =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(
        AudioLayer.pipe(Layer.provide([backend]), Layer.provideMerge([Logger.layer([])])),
      ),
      Effect.scoped,
    ),
  )

describe('Audio', () => {
  test('exposes the latest snapshot from the backend', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([speaker(), speaker({ volume: 0.8, icon: 'audio-volume-high-symbolic' })])
        .pipe(Stream.concat(Stream.never)),
    )

    const state = await run(
      Effect.gen(function* () {
        const audio = yield* Audio
        yield* Effect.sleep('200 millis')
        return yield* audio.snapshot
      }),
      backend.layer,
    )

    assert.equal(state.volume, 0.8)
    assert.equal(state.icon, 'audio-volume-high-symbolic')
    assert.equal(state.hasSpeaker, true)
  })

  test('starts from the empty state before the backend emits', async () => {
    const backend = fakeBackend(Stream.never)

    const state = await run(
      Effect.gen(function* () {
        const audio = yield* Audio
        return yield* audio.snapshot
      }),
      backend.layer,
    )

    assert.deepEqual(state, emptyState)
    assert.equal(state.hasSpeaker, false)
  })

  test('routes actions to the backend', async () => {
    const backend = fakeBackend(Stream.never)

    await run(
      Effect.gen(function* () {
        const audio = yield* Audio
        yield* audio.setVolume(0.25)
        yield* audio.toggleMute
      }),
      backend.layer,
    )

    assert.deepEqual(backend.calls, ['setVolume:0.25', 'toggleMute'])
  })

  test('keeps the last state when the source fails terminally', async () => {
    const backend = fakeBackend(
      Stream.fromIterable([speaker({ volume: 0.6 })]).pipe(
        Stream.concat(Stream.fail(new SourceError({ domain: 'audio', reason: 'wireplumber gone' }))),
      ),
    )

    const state = await run(
      Effect.gen(function* () {
        const audio = yield* Audio
        yield* Effect.sleep('200 millis')
        return yield* audio.snapshot
      }),
      backend.layer,
    )

    assert.equal(state.volume, 0.6, 'state should freeze at the last good value, not reset')
  })
})
