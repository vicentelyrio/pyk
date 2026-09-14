import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { Brightness, emptyState, type BrightnessState } from './store'

export const brightnessState: Accessor<BrightnessState> = createServiceAccessor(
  emptyState,
  Brightness,
  (brightness) => brightness.changes,
)
