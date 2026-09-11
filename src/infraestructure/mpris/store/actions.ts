import { dispatch } from '@/infraestructure/runtime'

import { Mpris } from './controller'

export function playPause(): void {
  dispatch(Mpris, (mpris) => mpris.playPause)
}

export function nextTrack(): void {
  dispatch(Mpris, (mpris) => mpris.next)
}

export function previousTrack(): void {
  dispatch(Mpris, (mpris) => mpris.previous)
}
