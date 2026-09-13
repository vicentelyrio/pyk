import { Effect, Layer, Stream } from 'effect'

import { Configuration } from '@/infrastructure/config/store/controller'

import { MINUTE, SECOND } from '../derived/ticks'
import { ClockBackend } from '../store/backend'
import { ticks } from './ticks'

export const ClockBackendLive = Layer.effect(
  ClockBackend,
  Effect.gen(function* () {
    const configuration = yield* Configuration

    return {
      changes: configuration.changes.pipe(
        Stream.map((config) => (config.clock.showSeconds ? SECOND : MINUTE)),
        Stream.changes,
        Stream.switchMap((unit) => ticks(unit)),
        Stream.map((now) => ({ now })),
      ),
    }
  }),
)
