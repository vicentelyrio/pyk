import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { Audio, emptyState, type AudioState } from './store'

export const audioState: Accessor<AudioState> = createServiceAccessor(
  emptyState,
  Audio,
  (audio) => audio.changes,
)
