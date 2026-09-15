import { Context, Effect } from 'effect'

import type { ActionError } from '@/infrastructure/effect'

export class Session extends Context.Service<Session, {
  readonly lock: Effect.Effect<void, ActionError>
  readonly suspend: Effect.Effect<void, ActionError>
  readonly reboot: Effect.Effect<void, ActionError>
  readonly powerOff: Effect.Effect<void, ActionError>
}>()('pyk/Session') {}
