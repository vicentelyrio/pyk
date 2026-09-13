import { Context, Stream } from 'effect'

import type { SourceError } from '@/infrastructure/effect'

import type { ScheduleState } from './state'

export class ScheduleBackend extends Context.Service<ScheduleBackend, {
  readonly changes: Stream.Stream<ScheduleState, SourceError>
}>()('pyk/ScheduleBackend') {}
