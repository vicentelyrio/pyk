import { Accessor, createMemo } from 'ags'

import type { NetworkState } from '../store/state'

export function connection(state: Accessor<NetworkState>) {
  return {
    kind: createMemo(() => state().kind),
    icon: createMemo(() => state().icon),
    ssid: createMemo(() => state().ssid),
    strength: createMemo(() => state().strength),
    isConnected: createMemo(() => state().isConnected),
    isConnecting: createMemo(() => state().isConnecting),
    wifiEnabled: createMemo(() => state().wifiEnabled),
  }
}
