import { Effect, Stream } from 'effect'

import { reconnecting, type SourceError } from '@/infrastructure/effect'

import { NiriIpc } from './ipc'
import { decodeEvent } from './protocol'
import { reduce } from './reducer'
import { emptyState, type NiriState } from './state'

export const stateChanges: Stream.Stream<NiriState, SourceError, NiriIpc> = Stream.unwrap(
  Effect.map(NiriIpc, (ipc) =>
    ipc.events.pipe(
      reconnecting,
      Stream.filterMapEffect(decodeEvent),
      Stream.scan(emptyState, reduce),
    ),
  ),
)
