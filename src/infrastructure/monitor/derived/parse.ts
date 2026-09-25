export interface Readings {
  readonly at: number
  readonly cpuBusy: number
  readonly cpuTotal: number
  readonly memTotal: number
  readonly memAvailable: number
  readonly netBytes: number
  readonly temp: number | null
}

export function parseCpu(stat: string): { readonly busy: number, readonly total: number } {
  const line = stat.split('\n').find((it) => it.startsWith('cpu ')) ?? ''
  const fields = line.trim().split(/\s+/).slice(1).map(Number).filter(Number.isFinite)
  const total = fields.slice(0, 8).reduce((sum, it) => sum + it, 0)
  const idle = (fields[3] ?? 0) + (fields[4] ?? 0)
  return { busy: total - idle, total }
}

export function parseMemory(meminfo: string): { readonly total: number, readonly available: number } {
  const read = (key: string) => {
    const match = meminfo.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm'))
    return match ? Number(match[1]) * 1024 : 0
  }
  return { total: read('MemTotal'), available: read('MemAvailable') }
}

export function parseNetwork(dev: string): number {
  return dev
    .split('\n')
    .slice(2)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('lo:'))
    .reduce((sum, line) => {
      const fields = line.slice(line.indexOf(':') + 1).trim().split(/\s+/).map(Number)
      return sum + (fields[0] ?? 0) + (fields[8] ?? 0)
    }, 0)
}
