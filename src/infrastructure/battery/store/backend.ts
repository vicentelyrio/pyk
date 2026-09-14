import { Context, Stream } from 'effect'

import type { SourceError } from '@/infrastructure/effect'

import type { BatteryState } from './state'

export class BatteryBackend extends Context.Service<BatteryBackend, {
  readonly changes: Stream.Stream<BatteryState, SourceError>
}>()('pyk/BatteryBackend') {}
