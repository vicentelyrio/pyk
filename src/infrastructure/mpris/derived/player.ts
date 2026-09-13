import { Accessor, createMemo } from 'ags'

import type { MprisState } from '../store/state'

export function player(state: Accessor<MprisState>) {
  const position = createMemo(() => state().position)
  const length = createMemo(() => state().length)

  return {
    hasPlayer: createMemo(() => state().hasPlayer),
    isPlaying: createMemo(() => state().isPlaying),
    identity: createMemo(() => state().identity),
    title: createMemo(() => state().title),
    artist: createMemo(() => state().artist),
    coverArt: createMemo(() => state().coverArt),
    position,
    length,
    remaining: createMemo(() => Math.max(length() - position(), 0)),
    progress: createMemo(() => (length() > 0 ? Math.min(position() / length(), 1) : 0)),
    canPlay: createMemo(() => state().canPlay),
    canGoNext: createMemo(() => state().canGoNext),
    canGoPrevious: createMemo(() => state().canGoPrevious),
  }
}
