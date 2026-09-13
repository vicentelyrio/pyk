import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { load } from './gjs/file'
import { defaultConfig, type Config } from './schema'
import { Configuration } from './store'

const initial = load()

export const configState: Accessor<Config> = createServiceAccessor(
  initial.ok ? initial.config : defaultConfig,
  Configuration,
  (configuration) => configuration.changes,
)
