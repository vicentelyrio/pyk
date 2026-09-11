import { Accessor, createMemo } from 'ags'

import type { MprisState } from '../store/state'

export function player(state: Accessor<MprisState>) {
  return {
    hasPlayer: createMemo(() => state().hasPlayer),
    isPlaying: createMemo(() => state().isPlaying),
    identity: createMemo(() => state().identity),
    title: createMemo(() => state().title),
    artist: createMemo(() => state().artist),
    canPlay: createMemo(() => state().canPlay),
    canGoNext: createMemo(() => state().canGoNext),
    canGoPrevious: createMemo(() => state().canGoPrevious),
  }
}
