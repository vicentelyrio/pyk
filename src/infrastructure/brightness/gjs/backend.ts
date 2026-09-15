import { Duration, Effect, Layer, Option, Queue, Ref, Stream, SubscriptionRef } from 'effect'

import { attemptPromise, fromSignal, report } from '@/infrastructure/effect'

import { clampLevel, toRaw } from '../derived/ddcutil'
import { BrightnessBackend } from '../store/backend'
import { emptyState } from '../store/state'
import { detect, monitorLevel, readLevel, writeLevel, type Device } from './devices'

const TIMEOUT = Duration.seconds(10)
const DEBOUNCE = Duration.millis(120)

export const BrightnessBackendLive = Layer.effect(
  BrightnessBackend,
  Effect.gen(function* () {
    const state = yield* SubscriptionRef.make(emptyState)
    const device = yield* Ref.make<Device | null>(null)
    const targets = yield* Queue.sliding<number>(1)

    const sync = (target: Device) =>
      attemptPromise('brightness', 'read', () => readLevel(target), TIMEOUT).pipe(
        Effect.flatMap((level) =>
          level === null
            ? Effect.void
            : SubscriptionRef.get(state).pipe(
              Effect.flatMap((current) =>
                current.source === target.kind && toRaw(current.level, target.max) === toRaw(level, target.max)
                  ? Effect.void
                  : SubscriptionRef.set(state, { source: target.kind, level })),
            )),
      )

    const watch = (target: Device) =>
      Effect.gen(function* () {
        const monitor = monitorLevel(target)
        if (!monitor) return

        yield* Effect.addFinalizer(() => Effect.sync(() => monitor.cancel()))

        yield* fromSignal('brightness', monitor, 'changed', () => null).pipe(
          Stream.drop(1),
          Stream.debounce(DEBOUNCE),
          Stream.runForEach(() => sync(target)),
        )
      })

    yield* attemptPromise('brightness', 'detect', () => detect(), TIMEOUT).pipe(
      Effect.flatMap((found) =>
        found
          ? Ref.set(device, found).pipe(Effect.andThen(sync(found)), Effect.andThen(watch(found)))
          : Effect.void),
      Effect.catchCause(report),
      Effect.forkScoped,
    )

    yield* Effect.gen(function* () {
      const level = yield* Queue.take(targets)
      const target = yield* Ref.get(device)
      if (!target) return
      yield* attemptPromise('brightness', 'write', () => writeLevel(target, level), TIMEOUT).pipe(
        Effect.catchCause(report),
      )
    }).pipe(Effect.forever, Effect.forkScoped)

    return {
      changes: SubscriptionRef.changes(state),
      setLevel: (level: number) =>
        Effect.gen(function* () {
          const target = yield* Ref.get(device)
          if (!target) return
          const clamped = clampLevel(level)
          yield* SubscriptionRef.update(state, (it) => ({ ...it, level: clamped }))
          yield* Queue.offer(targets, clamped)
        }),
      refresh: Ref.get(device).pipe(
        Effect.flatMap((target) => (target ? sync(target) : Effect.void)),
      ),
    }
  }),
)
