import { Context, Stream } from 'effect'

import type { SourceError } from '@/infrastructure/effect'

import type { ClockState } from './state'

export class ClockBackend extends Context.Service<ClockBackend, {
  readonly changes: Stream.Stream<ClockState, SourceError>
}>()('pyk/ClockBackend') {}
