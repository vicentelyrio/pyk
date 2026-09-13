import { Accessor, createMemo } from 'ags'
import { Equal } from 'effect'

import type { WallpaperState } from '../store/state'

export function gallery(state: Accessor<WallpaperState>) {
  return {
    directory: createMemo(() => state().directory),
    images: createMemo(() => state().images, { equals: Equal.equals }),
  }
}
