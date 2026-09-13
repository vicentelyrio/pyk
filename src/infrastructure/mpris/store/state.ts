export interface MprisState {
  readonly hasPlayer: boolean
  readonly isPlaying: boolean
  readonly identity: string
  readonly title: string
  readonly artist: string
  readonly coverArt: string
  readonly position: number
  readonly length: number
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
  coverArt: '',
  position: 0,
  length: 0,
  canPlay: false,
  canGoNext: false,
  canGoPrevious: false,
}
