import { Context, Effect, Stream } from 'effect'

import type { ActionError, SourceError } from '@/infrastructure/effect'

export class NiriIpc extends Context.Service<NiriIpc, {
  readonly events: Stream.Stream<string, SourceError>
  readonly send: (
    action: string,
    args: ReadonlyArray<string>,
  ) => Effect.Effect<unknown, ActionError>
}>()('pyk/NiriIpc') {}
