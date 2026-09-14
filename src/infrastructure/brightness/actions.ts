import { dispatch } from '@/infrastructure/runtime'

import { Brightness } from './store'

export function setLevel(level: number): void {
  dispatch(Brightness, (brightness) => brightness.setLevel(level))
}

export function refresh(): void {
  dispatch(Brightness, (brightness) => brightness.refresh)
}
