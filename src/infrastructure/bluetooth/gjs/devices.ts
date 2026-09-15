import AstalBluetooth from 'gi://AstalBluetooth'

import type { BluetoothDevice, BluetoothState } from '../store/state'

function displayName(device: AstalBluetooth.Device): string {
  const alias = device.alias || device.name || ''
  if (!alias) return device.address

  const asAddress = alias.replace(/-/g, ':').toUpperCase()

  return asAddress === device.address.toUpperCase() ? device.address : alias
}

function toDevice(device: AstalBluetooth.Device): BluetoothDevice {
  return {
    address: device.address,
    name: displayName(device),
    icon: device.icon ?? '',
    isPaired: device.paired,
    isConnected: device.connected,
    isConnecting: device.connecting,
    battery: device.batteryPercentage,
  }
}

function byConnectionThenName(a: BluetoothDevice, b: BluetoothDevice): number {
  if (a.isConnected !== b.isConnected) return a.isConnected ? -1 : 1

  return a.name.localeCompare(b.name)
}

function byName(a: BluetoothDevice, b: BluetoothDevice): number {
  return a.name.localeCompare(b.name)
}

export function pairedDevices(
  bluetooth: AstalBluetooth.Bluetooth,
): AstalBluetooth.Device[] {
  return bluetooth.get_devices().filter((device) => device.paired)
}

export function snapshot(bluetooth: AstalBluetooth.Bluetooth): BluetoothState {
  const adapter = bluetooth.get_adapter()
  const devices = bluetooth.get_devices()

  return {
    hasAdapter: adapter !== null,
    isPowered: bluetooth.isPowered,
    isConnected: bluetooth.isConnected,
    isDiscovering: adapter?.discovering ?? false,
    devices: devices.filter((it) => it.paired).map(toDevice).sort(byConnectionThenName),
    discovered: devices.filter((it) => !it.paired).map(toDevice).sort(byName),
  }
}
