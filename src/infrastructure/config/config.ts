import { reset, write } from './actions'
import { configState } from './bridge'
import { sections } from './derived'
import { configPath } from './gjs/file'
import { configSpec } from './schema'

export const config = {
  ...sections(configState),
  state: configState,
  spec: configSpec,
  path: configPath,
  write,
  reset,
} as const
