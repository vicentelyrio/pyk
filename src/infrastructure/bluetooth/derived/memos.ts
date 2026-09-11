import { Accessor, createMemo } from 'ags'
import { Equal } from 'effect'

import type { BluetoothState } from '../store/state'

export function adapter(state: Accessor<BluetoothState>) {
  return {
    hasAdapter: createMemo(() => state().hasAdapter),
    isPowered: createMemo(() => state().isPowered),
    isConnected: createMemo(() => state().isConnected),
    devices: createMemo(() => state().devices, { equals: Equal.equals }),
  }
}
