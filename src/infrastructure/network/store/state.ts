export type NetworkKind = 'wifi' | 'wired' | 'none'

export interface NetworkState {
  readonly kind: NetworkKind
  readonly icon: string
  readonly ssid: string
  readonly strength: number
  readonly isConnected: boolean
  readonly isConnecting: boolean
  readonly wifiEnabled: boolean
}

export const emptyState: NetworkState = {
  kind: 'none',
  icon: 'network-wireless-offline-symbolic',
  ssid: '',
  strength: 0,
  isConnected: false,
  isConnecting: false,
  wifiEnabled: false,
}
