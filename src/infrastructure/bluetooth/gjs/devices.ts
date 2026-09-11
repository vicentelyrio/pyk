import AstalBluetooth from 'gi://AstalBluetooth'

import type { BluetoothDevice, BluetoothState } from '../store/state'

function toDevice(device: AstalBluetooth.Device): BluetoothDevice {
  return {
    address: device.address,
    name: device.alias || device.name,
    icon: device.icon,
    isConnected: device.connected,
    isConnecting: device.connecting,
    battery: device.batteryPercentage,
  }
}

function byConnectionThenName(a: BluetoothDevice, b: BluetoothDevice): number {
  if (a.isConnected !== b.isConnected) return a.isConnected ? -1 : 1

  return a.name.localeCompare(b.name)
}

export function pairedDevices(
  bluetooth: AstalBluetooth.Bluetooth,
): AstalBluetooth.Device[] {
  return bluetooth.get_devices().filter((device) => device.paired)
}

export function snapshot(bluetooth: AstalBluetooth.Bluetooth): BluetoothState {
  return {
    hasAdapter: bluetooth.get_adapter() !== null,
    isPowered: bluetooth.isPowered,
    isConnected: bluetooth.isConnected,
    devices: pairedDevices(bluetooth).map(toDevice).sort(byConnectionThenName),
  }
}
