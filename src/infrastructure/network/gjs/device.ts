import AstalNetwork from 'gi://AstalNetwork'

import { emptyState, type NetworkState } from '../store/state'

export type Device = AstalNetwork.Wifi | AstalNetwork.Wired

export function activeDevice(network: AstalNetwork.Network): Device | null {
  const { wifi, wired } = network

  if (network.primary === AstalNetwork.Primary.WIFI && wifi) return wifi
  if (network.primary === AstalNetwork.Primary.WIRED && wired) return wired

  return wifi ?? wired ?? null
}

export function snapshot(network: AstalNetwork.Network): NetworkState {
  const device = activeDevice(network)

  if (!device) return emptyState

  const wifi = network.wifi
  const isWifi = device === wifi
  const wifiEnabled = wifi?.enabled ?? false

  return {
    kind: isWifi ? 'wifi' : 'wired',
    icon: device.iconName,
    ssid: isWifi ? (wifi?.ssid ?? '') : '',
    strength: isWifi ? (wifi?.strength ?? 0) : 0,
    isConnected: device.internet === AstalNetwork.Internet.CONNECTED,
    isConnecting: device.internet === AstalNetwork.Internet.CONNECTING,
    wifiEnabled,
  }
}
