import { dispatch, request } from '@/infrastructure/runtime'

import { Network } from './store'

export function toggleWifi(): void {
  dispatch(Network, (network) => network.toggleWifi)
}

export function scan(): void {
  dispatch(Network, (network) => network.scan)
}

export function disconnect(): void {
  dispatch(Network, (network) => network.disconnect)
}

export async function connect(bssid: string, password: string | null): Promise<boolean> {
  const result = await request(Network, (network) => network.connect(bssid, password))

  return result !== null
}
