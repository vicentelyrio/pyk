import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { emptyState, Wallpaper, type WallpaperState } from './store'

export const wallpaperState: Accessor<WallpaperState> = createServiceAccessor(
  emptyState,
  Wallpaper,
  (wallpaper) => wallpaper.changes,
)
