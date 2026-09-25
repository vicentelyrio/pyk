import { Context, Stream } from 'effect'

import type { SourceError } from '@/infrastructure/effect'

import type { MonitorState } from './state'

export class MonitorBackend extends Context.Service<MonitorBackend, {
  readonly changes: Stream.Stream<MonitorState, SourceError>
}>()('pyk/MonitorBackend') {}
