const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function formatUptime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const days = Math.floor(total / DAY)
  const hours = Math.floor((total % DAY) / HOUR)
  const minutes = Math.floor((total % HOUR) / MINUTE)

  if (days > 0) return `up ${days}d ${hours}h`
  if (hours > 0) return `up ${hours}h ${minutes}m`
  return `up ${minutes}m`
}

export function parseOsRelease(text: string): string {
  const fields = new Map<string, string>()

  for (const line of text.split('\n')) {
    const match = /^([A-Z_]+)=(.*)$/.exec(line.trim())
    if (match) fields.set(match[1]!, match[2]!.replace(/^["']|["']$/g, ''))
  }

  return fields.get('ID') ?? fields.get('NAME')?.toLowerCase() ?? 'linux'
}
