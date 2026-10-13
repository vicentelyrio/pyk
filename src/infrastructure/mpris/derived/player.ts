import { Accessor, createMemo } from 'ags'

import type { MprisState } from '../store/state'

export function player(state: Accessor<MprisState>) {
  const position = createMemo(() => state().position)
  const length = createMemo(() => state().length)
  const loop = createMemo(() => state().loop)
  const shuffle = createMemo(() => state().shuffle)
  const hasPlayer = createMemo(() => state().hasPlayer)

  return {
    hasPlayer,
    isPlaying: createMemo(() => state().isPlaying),
    identity: createMemo(() => state().identity),
    source: createMemo(() => {
      const { identity, channel } = state()
      return channel.name ? `${channel.name} · ${identity}` : identity
    }),
    title: createMemo(() => state().title),
    artist: createMemo(() => state().artist),
    album: createMemo(() => state().album),
    coverArt: createMemo(() => state().coverArt),
    position,
    length,
    remaining: createMemo(() => Math.max(length() - position(), 0)),
    isLive: createMemo(() => hasPlayer() && length() === 0),
    progress: createMemo(() => (length() > 0 ? Math.min(position() / length(), 1) : 0)),
    canPlay: createMemo(() => state().canPlay),
    canSeek: createMemo(() => state().canSeek),
    canGoNext: createMemo(() => state().canGoNext),
    canGoPrevious: createMemo(() => state().canGoPrevious),
    loop,
    shuffle,
    hasLoop: createMemo(() => loop() !== 'unsupported'),
    hasShuffle: createMemo(() => shuffle() !== 'unsupported'),
    isShuffled: createMemo(() => shuffle() === 'on'),
    isLooping: createMemo(() => loop() === 'track' || loop() === 'playlist'),
  }
}
