export interface BluetoothDevice {
  readonly address: string
  readonly name: string
  readonly icon: string
  readonly isConnected: boolean
  readonly isConnecting: boolean
  readonly battery: number
}

export interface BluetoothState {
  readonly hasAdapter: boolean
  readonly isPowered: boolean
  readonly isConnected: boolean
  readonly devices: readonly BluetoothDevice[]
}

export const emptyState: BluetoothState = {
  hasAdapter: false,
  isPowered: false,
  isConnected: false,
  devices: [],
}
