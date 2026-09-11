export interface AudioState {
  readonly hasSpeaker: boolean
  readonly volume: number
  readonly isMuted: boolean
  readonly icon: string
  readonly description: string
}

export const emptyState: AudioState = {
  hasSpeaker: false,
  volume: 0,
  isMuted: false,
  icon: 'audio-volume-muted-symbolic',
  description: '',
}
