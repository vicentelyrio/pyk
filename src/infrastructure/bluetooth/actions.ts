import { dispatch, request } from '@/infrastructure/runtime'

import { Bluetooth } from './store'

export function togglePower(): void {
  dispatch(Bluetooth, (bluetooth) => bluetooth.togglePower)
}

export function toggleScan(): void {
  dispatch(Bluetooth, (bluetooth) => bluetooth.toggleScan)
}

export function remove(address: string): void {
  dispatch(Bluetooth, (bluetooth) => bluetooth.remove(address))
}

export function pair(address: string): void {
  dispatch(Bluetooth, (bluetooth) => bluetooth.pair(address))
}

export async function toggleDevice(address: string): Promise<boolean> {
  const result = await request(Bluetooth, (bluetooth) => bluetooth.toggleDevice(address))

  return result !== null
}
