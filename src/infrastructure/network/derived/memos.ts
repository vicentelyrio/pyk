import { Accessor, createMemo } from 'ags'
import { Equal } from 'effect'

import type { NetworkState } from '../store/state'

export function connection(state: Accessor<NetworkState>) {
  return {
    kind: createMemo(() => state().kind),
    icon: createMemo(() => state().icon),
    ssid: createMemo(() => state().ssid),
    strength: createMemo(() => state().strength),
    isConnected: createMemo(() => state().isConnected),
    isConnecting: createMemo(() => state().isConnecting),
    hasWifi: createMemo(() => state().hasWifi),
    wifiEnabled: createMemo(() => state().wifiEnabled),
    isScanning: createMemo(() => state().isScanning),
    security: createMemo(() => state().security),
    frequency: createMemo(() => state().frequency),
    address: createMemo(() => state().address),
    gateway: createMemo(() => state().gateway),
    accessPoints: createMemo(() => state().accessPoints, { equals: Equal.equals }),
  }
}
