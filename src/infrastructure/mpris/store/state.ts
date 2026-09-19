export type MprisLoop = 'unsupported' | 'none' | 'track' | 'playlist'

export type MprisShuffle = 'unsupported' | 'on' | 'off'

export interface MprisState {
  readonly hasPlayer: boolean
  readonly isPlaying: boolean
  readonly identity: string
  readonly title: string
  readonly artist: string
  readonly album: string
  readonly coverArt: string
  readonly position: number
  readonly length: number
  readonly canPlay: boolean
  readonly canSeek: boolean
  readonly canGoNext: boolean
  readonly canGoPrevious: boolean
  readonly loop: MprisLoop
  readonly shuffle: MprisShuffle
}

export const emptyState: MprisState = {
  hasPlayer: false,
  isPlaying: false,
  identity: '',
  title: '',
  artist: '',
  album: '',
  coverArt: '',
  position: 0,
  length: 0,
  canPlay: false,
  canSeek: false,
  canGoNext: false,
  canGoPrevious: false,
  loop: 'unsupported',
  shuffle: 'unsupported',
}
