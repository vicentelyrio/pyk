import { Effect, Layer, Stream } from 'effect'

import { Configuration } from '@/infrastructure/config/store/controller'
import { attempt, report } from '@/infrastructure/effect'
import { INSTANCE_NAME } from '@/infrastructure/instance'

import { renderBinds } from '../niri/binds'
import { niriBindsPath, writeNiriBinds } from './niri'

export const NiriBindsLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const configuration = yield* Configuration

    yield* configuration.changes.pipe(
      Stream.map(({ shortcuts }) => (shortcuts.niriBinds ? renderBinds(shortcuts.global, INSTANCE_NAME) : '')),
      Stream.changes,
      Stream.runForEach((content) =>
        attempt('shortcuts', 'writeNiriBinds', () => writeNiriBinds(content)).pipe(
          Effect.tap((written) =>
            written ? Effect.logInfo(`wrote ${niriBindsPath}`) : Effect.void,
          ),
          Effect.catchCause(report),
        ),
      ),
      Effect.annotateLogs({ domain: 'shortcuts' }),
      Effect.forkScoped,
    )
  }),
)
