import AstalNetwork from 'gi://AstalNetwork'

import { emptyState, type NetworkState } from '../store/state'
import { accessPoints, security } from './access-points'

export type Device = AstalNetwork.Wifi | AstalNetwork.Wired

export function activeDevice(network: AstalNetwork.Network): Device | null {
  const { wifi, wired } = network

  if (network.primary === AstalNetwork.Primary.WIFI && wifi) return wifi
  if (network.primary === AstalNetwork.Primary.WIRED && wired) return wired

  return wifi ?? wired ?? null
}

function address(wifi: AstalNetwork.Wifi): { readonly address: string, readonly gateway: string } {
  const config = wifi.get_device().get_ip4_config()
  if (!config) return { address: '', gateway: '' }

  const [first] = config.get_addresses()

  return {
    address: first ? `${first.get_address()}/${first.get_prefix()}` : '',
    gateway: config.get_gateway() ?? '',
  }
}

export function snapshot(network: AstalNetwork.Network): NetworkState {
  const device = activeDevice(network)
  const wifi = network.wifi ?? null

  const radio = {
    hasWifi: wifi !== null,
    wifiEnabled: wifi?.enabled ?? false,
    isScanning: wifi?.scanning ?? false,
    accessPoints: accessPoints(network),
  }

  if (!device) return { ...emptyState, ...radio }

  const isWifi = device === wifi
  const point = isWifi ? wifi?.get_active_access_point() ?? null : null

  return {
    ...radio,
    kind: isWifi ? 'wifi' : 'wired',
    icon: device.iconName,
    ssid: isWifi ? (wifi?.ssid ?? '') : '',
    strength: isWifi ? (wifi?.strength ?? 0) : 0,
    isConnected: device.internet === AstalNetwork.Internet.CONNECTED,
    isConnecting: device.internet === AstalNetwork.Internet.CONNECTING,
    security: point ? security(point) : '',
    frequency: isWifi ? (wifi?.frequency ?? 0) : 0,
    ...(isWifi && wifi ? address(wifi) : { address: '', gateway: '' }),
  }
}
