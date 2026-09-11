import { Effect, Schedule, Stream } from 'effect'

import { logFailure, type SourceError } from '@/infraestructure/effect'

import { NiriIpc } from './ipc'
import { decodeEvent } from './protocol'
import { reduce } from './reducer'
import { emptyState, type NiriState } from './state'

const reconnect = Schedule.min([
  Schedule.exponential('500 millis', 2),
  Schedule.spaced('5 seconds'),
]).pipe(Schedule.jittered)

export const stateChanges: Stream.Stream<NiriState, SourceError, NiriIpc> = Stream.unwrap(
  Effect.map(NiriIpc, (ipc) =>
    ipc.events.pipe(
      Stream.tapError((error) => logFailure(error)),
      Stream.retry(reconnect),
      Stream.filterMapEffect(decodeEvent),
      Stream.scan(emptyState, reduce),
    ),
  ),
)
