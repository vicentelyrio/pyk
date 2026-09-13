import { Context } from 'effect'

import { defaultConfig, type Config } from '../schema/schema'

export const StartupConfig = Context.Reference<Config>('pyk/StartupConfig', {
  defaultValue: () => defaultConfig,
})
