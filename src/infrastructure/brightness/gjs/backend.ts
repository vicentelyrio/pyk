import { Duration, Effect, Layer, Option, Queue, Ref, SubscriptionRef } from 'effect'

import { attemptPromise, report } from '@/infrastructure/effect'

import { clampLevel } from '../derived/ddcutil'
import { BrightnessBackend } from '../store/backend'
import { emptyState } from '../store/state'
import { detect, readLevel, writeLevel, type Device } from './devices'

const TIMEOUT = Duration.seconds(10)

export const BrightnessBackendLive = Layer.effect(
  BrightnessBackend,
  Effect.gen(function* () {
    const state = yield* SubscriptionRef.make(emptyState)
    const device = yield* Ref.make<Device | null>(null)
    const targets = yield* Queue.sliding<number>(1)

    const sync = (target: Device) =>
      attemptPromise('brightness', 'read', () => readLevel(target), TIMEOUT).pipe(
        Effect.flatMap((level) =>
          level === null ? Effect.void : SubscriptionRef.set(state, { source: target.kind, level })),
      )

    yield* attemptPromise('brightness', 'detect', () => detect(), TIMEOUT).pipe(
      Effect.flatMap((found) =>
        found
          ? Ref.set(device, found).pipe(Effect.andThen(sync(found)))
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
