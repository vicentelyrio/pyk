import { dispatch } from '@/infrastructure/runtime'

import { Mpris } from './store'

export function playPause(): void {
  dispatch(Mpris, (mpris) => mpris.playPause)
}

export function nextTrack(): void {
  dispatch(Mpris, (mpris) => mpris.next)
}

export function previousTrack(): void {
  dispatch(Mpris, (mpris) => mpris.previous)
}

export function seek(position: number): void {
  dispatch(Mpris, (mpris) => mpris.seek(position))
}

export function toggleShuffle(): void {
  dispatch(Mpris, (mpris) => mpris.toggleShuffle)
}

export function cycleLoop(): void {
  dispatch(Mpris, (mpris) => mpris.cycleLoop)
}
