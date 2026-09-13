import { dispatch } from '@/infrastructure/runtime'

import type { ConfigPatch } from './schema'
import { Configuration } from './store'

export function write(patch: ConfigPatch): void {
  dispatch(Configuration, (configuration) => configuration.write(patch))
}

export function reset(): void {
  dispatch(Configuration, (configuration) => configuration.reset)
}
