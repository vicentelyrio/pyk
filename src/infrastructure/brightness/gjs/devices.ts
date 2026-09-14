import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import { execAsync } from 'ags/process'

import { parseDetectBus, parseVcp, toRaw } from '../derived/ddcutil'

export type Device =
  | { readonly kind: 'backlight', readonly name: string, readonly max: number }
  | { readonly kind: 'ddcutil', readonly bus: number, readonly max: number }

const BACKLIGHT = '/sys/class/backlight'

function readNumber(path: string): number | null {
  try {
    const [, bytes] = GLib.file_get_contents(path)
    const value = Number.parseInt(new TextDecoder().decode(bytes).trim(), 10)
    return Number.isFinite(value) ? value : null
  }
  catch {
    return null
  }
}

function findBacklight(): Device | null {
  if (!GLib.file_test(BACKLIGHT, GLib.FileTest.IS_DIR)) return null

  const dir = GLib.Dir.open(BACKLIGHT, 0)
  try {
    for (let name = dir.read_name(); name; name = dir.read_name()) {
      const max = readNumber(`${BACKLIGHT}/${name}/max_brightness`)
      if (max && max > 0) return { kind: 'backlight', name, max }
    }
  }
  finally {
    dir.close()
  }

  return null
}

export async function detect(): Promise<Device | null> {
  const backlight = findBacklight()
  if (backlight) return backlight

  const bus = parseDetectBus(await execAsync(['ddcutil', '--terse', 'detect']))
  if (bus === null) return null

  const vcp = parseVcp(await execAsync(['ddcutil', '--bus', String(bus), '--terse', 'getvcp', '10']))
  return vcp ? { kind: 'ddcutil', bus, max: vcp.max } : null
}

export async function readLevel(device: Device): Promise<number | null> {
  if (device.kind === 'backlight') {
    const current = readNumber(`${BACKLIGHT}/${device.name}/brightness`)
    return current === null ? null : current / device.max
  }

  const vcp = parseVcp(await execAsync(['ddcutil', '--bus', String(device.bus), '--terse', 'getvcp', '10']))
  return vcp ? vcp.current / vcp.max : null
}

export function writeLevel(device: Device, level: number): Promise<unknown> {
  const raw = toRaw(level, device.max)

  if (device.kind === 'ddcutil') {
    return execAsync(['ddcutil', '--bus', String(device.bus), '--noverify', 'setvcp', '10', String(raw)])
  }

  return new Promise((resolve, reject) => {
    Gio.DBus.system.call(
      'org.freedesktop.login1',
      '/org/freedesktop/login1/session/auto',
      'org.freedesktop.login1.Session',
      'SetBrightness',
      new GLib.Variant('(ssu)', ['backlight', device.name, raw]),
      null,
      Gio.DBusCallFlags.NONE,
      -1,
      null,
      (connection, result) => {
        try {
          resolve(connection!.call_finish(result))
        }
        catch (cause) {
          reject(cause)
        }
      },
    )
  })
}
