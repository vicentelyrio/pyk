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
