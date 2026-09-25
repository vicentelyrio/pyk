import GLib from 'gi://GLib'

import type { Readings } from '../derived'
import { parseCpu, parseMemory, parseNetwork } from '../derived'

const HWMON = '/sys/class/hwmon'
const CPU_SENSORS = ['coretemp', 'k10temp', 'zenpower', 'cpu_thermal', 'acpitz']

function readText(path: string): string {
  try {
    const [, bytes] = GLib.file_get_contents(path)
    return new TextDecoder().decode(bytes)
  }
  catch {
    return ''
  }
}

export function findTempSensor(): string | null {
  const dir = GLib.Dir.open(HWMON, 0)
  const found = new Map<string, string>()

  try {
    for (let name = dir.read_name(); name; name = dir.read_name()) {
      const base = GLib.build_filenamev([HWMON, name])
      const input = GLib.build_filenamev([base, 'temp1_input'])
      if (GLib.file_test(input, GLib.FileTest.EXISTS)) found.set(readText(GLib.build_filenamev([base, 'name'])).trim(), input)
    }
  }
  finally {
    dir.close()
  }

  const sensor = CPU_SENSORS.find((it) => found.has(it))
  return sensor ? found.get(sensor) ?? null : null
}

export function read(sensor: string | null): Readings {
  const cpu = parseCpu(readText('/proc/stat'))
  const mem = parseMemory(readText('/proc/meminfo'))
  const millidegrees = sensor ? Number.parseInt(readText(sensor), 10) : Number.NaN

  return {
    at: Math.floor(GLib.get_monotonic_time() / 1000),
    cpuBusy: cpu.busy,
    cpuTotal: cpu.total,
    memTotal: mem.total,
    memAvailable: mem.available,
    netBytes: parseNetwork(readText('/proc/net/dev')),
    temp: Number.isFinite(millidegrees) ? millidegrees / 1000 : null,
  }
}
