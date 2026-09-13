import { launch, reload } from './actions'
import { appsState } from './bridge'
import { catalog, kind, search } from './derived'

export const apps = {
  ...catalog(appsState),
  search,
  kind,
  launch,
  reload,
} as const
