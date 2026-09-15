import AstalNetwork from 'gi://AstalNetwork'
import NM from 'gi://NM'

import type { AccessPoint } from '../store/state'

const flags = (NM as unknown as Record<string, Record<string, number>>)['80211ApSecurityFlags']

const KEY_MGMT_PSK = flags.KEY_MGMT_PSK
const KEY_MGMT_EAP = flags.KEY_MGMT_802_1X
const KEY_MGMT_SAE = flags.KEY_MGMT_SAE

export function security(point: AstalNetwork.AccessPoint): string {
  const rsn = point.rsnFlags as unknown as number

  if (rsn & KEY_MGMT_SAE) return 'WPA3'
  if (rsn & (KEY_MGMT_PSK | KEY_MGMT_EAP)) return 'WPA2'
  if ((point.wpaFlags as unknown as number) !== 0) return 'WPA'

  return point.requiresPassword ? 'WEP' : 'Open'
}

function savedSsids(client: NM.Client): Set<string> {
  const saved = new Set<string>()

  for (const connection of client.get_connections()) {
    const data = connection.get_setting_wireless()?.get_ssid()?.get_data()
    if (data) saved.add(NM.utils_ssid_to_utf8(data))
  }

  return saved
}

function byStrengthThenName(a: AccessPoint, b: AccessPoint): number {
  if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
  if (a.strength !== b.strength) return b.strength - a.strength

  return a.ssid.localeCompare(b.ssid)
}

export function accessPoints(network: AstalNetwork.Network): readonly AccessPoint[] {
  const wifi = network.wifi ?? null
  if (!wifi) return []

  const saved = savedSsids(network.get_client())
  const active = wifi.get_active_access_point()
  const activeSsid = active ? (active.ssid ?? '') : ''

  const strongest = new Map<string, AstalNetwork.AccessPoint>()

  for (const point of wifi.get_access_points()) {
    const ssid = point.ssid ?? ''
    if (!ssid) continue

    const seen = strongest.get(ssid)
    if (!seen || point.strength > seen.strength) strongest.set(ssid, point)
  }

  return [...strongest.values()]
    .map((point) => ({
      ssid: point.ssid ?? '',
      bssid: point.bssid,
      strength: point.strength,
      secure: point.requiresPassword,
      saved: saved.has(point.ssid ?? ''),
      isActive: activeSsid !== '' && point.ssid === activeSsid,
    }))
    .sort(byStrengthThenName)
}
