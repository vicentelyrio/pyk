export interface MprisState {
  readonly hasPlayer: boolean
  readonly isPlaying: boolean
  readonly identity: string
  readonly title: string
  readonly artist: string
  readonly canPlay: boolean
  readonly canGoNext: boolean
  readonly canGoPrevious: boolean
}

export const emptyState: MprisState = {
  hasPlayer: false,
  isPlaying: false,
  identity: '',
  title: '',
  artist: '',
  canPlay: false,
  canGoNext: false,
  canGoPrevious: false,
}

export function sameMprisState(a: MprisState, b: MprisState): boolean {
  return (
    a.hasPlayer === b.hasPlayer &&
    a.isPlaying === b.isPlaying &&
    a.identity === b.identity &&
    a.title === b.title &&
    a.artist === b.artist &&
    a.canPlay === b.canPlay &&
    a.canGoNext === b.canGoNext &&
    a.canGoPrevious === b.canGoPrevious
  )
}
