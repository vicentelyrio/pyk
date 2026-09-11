import type { Accessor } from 'ags'

import { createServiceAccessor } from '@/infrastructure/runtime'

import { Bluetooth, emptyState, type BluetoothState } from './store'

export const bluetoothState: Accessor<BluetoothState> = createServiceAccessor(
  emptyState,
  Bluetooth,
  (bluetooth) => bluetooth.changes,
)
