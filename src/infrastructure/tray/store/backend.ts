import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

import type { TrayState } from './state'

export class TrayBackend extends Context.Service<TrayBackend, {
  readonly changes: Stream.Stream<TrayState, SourceError>
  readonly activate: (id: string, x: number, y: number) => Effect.Effect<void, ActionError>
  readonly secondaryActivate: (id: string, x: number, y: number) => Effect.Effect<void, ActionError>
  readonly aboutToShow: (id: string) => Effect.Effect<void, ActionError>
}>()('pyk/TrayBackend') {}
