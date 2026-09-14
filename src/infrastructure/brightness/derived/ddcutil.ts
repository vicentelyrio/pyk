export function parseDetectBus(output: string): number | null {
  const match = /I2C bus:\s*\/dev\/i2c-(\d+)/.exec(output)
  return match ? Number(match[1]) : null
}

export function parseVcp(output: string): { readonly current: number, readonly max: number } | null {
  const match = /VCP\s+10\s+C\s+(\d+)\s+(\d+)/.exec(output)
  if (!match) return null

  const current = Number(match[1])
  const max = Number(match[2])
  return max > 0 ? { current, max } : null
}

export function clampLevel(level: number): number {
  return Math.min(1, Math.max(0, level))
}

export function toRaw(level: number, max: number): number {
  return Math.round(clampLevel(level) * max)
}
