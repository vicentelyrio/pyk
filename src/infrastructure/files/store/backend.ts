import { Context, Effect } from 'effect'

import type { ActionError } from '@/infrastructure/effect'

import type { FileHit } from './state'

export class Files extends Context.Service<Files, {
  readonly search: (query: string) => Effect.Effect<readonly FileHit[], ActionError>
  readonly open: (path: string) => Effect.Effect<void, ActionError>
}>()('pyk/Files') {}
