import { dispatch } from '@/infrastructure/runtime'

import { Bluetooth } from './store'

export function togglePower(): void {
  dispatch(Bluetooth, (bluetooth) => bluetooth.togglePower)
}

export function toggleDevice(address: string): void {
  dispatch(Bluetooth, (bluetooth) => bluetooth.toggleDevice(address))
}
