import { dispatch } from '@/infrastructure/runtime'

import { Tray } from './store'

export function activate(id: string, x: number, y: number): void {
  dispatch(Tray, (tray) => tray.activate(id, x, y))
}

export function secondaryActivate(id: string, x: number, y: number): void {
  dispatch(Tray, (tray) => tray.secondaryActivate(id, x, y))
}

export function aboutToShow(id: string): void {
  dispatch(Tray, (tray) => tray.aboutToShow(id))
}
