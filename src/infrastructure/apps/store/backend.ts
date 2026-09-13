import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { AppsState } from './state'

export class AppsBackend extends Context.Service<AppsBackend, {
  readonly changes: Stream.Stream<AppsState, SourceError>
  readonly launch: (id: string) => Effect.Effect<void, ActionError>
  readonly reload: Effect.Effect<void, ActionError>
}>()('pyk/AppsBackend') {}
