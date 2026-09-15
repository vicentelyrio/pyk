export type NetworkKind = 'wifi' | 'wired' | 'none'

export interface AccessPoint {
  readonly ssid: string
  readonly bssid: string
  readonly strength: number
  readonly secure: boolean
  readonly saved: boolean
  readonly isActive: boolean
}

export interface NetworkState {
  readonly kind: NetworkKind
  readonly icon: string
  readonly ssid: string
  readonly strength: number
  readonly isConnected: boolean
  readonly isConnecting: boolean
  readonly hasWifi: boolean
  readonly wifiEnabled: boolean
  readonly isScanning: boolean
  readonly security: string
  readonly frequency: number
  readonly address: string
  readonly gateway: string
  readonly accessPoints: readonly AccessPoint[]
}

export const emptyState: NetworkState = {
  kind: 'none',
  icon: 'network-wireless-offline-symbolic',
  ssid: '',
  strength: 0,
  isConnected: false,
  isConnecting: false,
  hasWifi: false,
  wifiEnabled: false,
  isScanning: false,
  security: '',
  frequency: 0,
  address: '',
  gateway: '',
  accessPoints: [],
}
