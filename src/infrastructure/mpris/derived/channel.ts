export interface ChannelRule {
  readonly match: string
  readonly name: string
  readonly cover: string
}

export interface TrackFields {
  readonly url: string
  readonly artist: string
  readonly title: string
  readonly album: string
}

interface ParsedUrl {
  readonly scheme: string
  readonly host: string
  readonly path: string
  readonly query: Readonly<Record<string, string>>
}

const URL_PARTS = /^([a-z][\w+.-]*):\/\/([^/?#]*)([^?#]*)(?:\?([^#]*))?/i

const PLACEHOLDER = /\{([\w.-]+)\}/g

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  }
  catch {
    return value
  }
}

function parseQuery(query: string): Record<string, string> {
  const out: Record<string, string> = {}

  for (const pair of query.split('&')) {
    if (!pair) continue
    const at = pair.indexOf('=')
    const key = decode(at === -1 ? pair : pair.slice(0, at))
    if (!(key in out)) out[key] = at === -1 ? '' : decode(pair.slice(at + 1))
  }

  return out
}

export function parseUrl(url: string): ParsedUrl | null {
  const parts = URL_PARTS.exec(url)
  if (!parts) return null

  return {
    scheme: parts[1]!.toLowerCase(),
    host: parts[2]!.replace(/^[^@]*@/, '').replace(/:\d+$/, '').toLowerCase(),
    path: decode(parts[3] ?? ''),
    query: parseQuery(parts[4] ?? ''),
  }
}

export function originOf(url: string): string {
  const parsed = parseUrl(url)
  if (!parsed) return ''
  if (parsed.scheme === 'file') return 'file'
  return parsed.scheme === 'http' || parsed.scheme === 'https' ? parsed.host : ''
}

export function localPath(url: string): string | null {
  const parsed = parseUrl(url)
  return parsed?.scheme === 'file' && parsed.path ? parsed.path : null
}

export function appOf(entry: string, busName: string): string {
  if (entry) return entry.toLowerCase()

  const name = busName.replace(/^org\.mpris\.MediaPlayer2\./, '').split('.')[0] ?? ''
  return name.toLowerCase()
}

function matches(pattern: string, value: string): boolean {
  const target = pattern.toLowerCase()
  return value !== '' && (value === target || value.endsWith(`.${target}`))
}

export function matchRule(
  rules: readonly ChannelRule[],
  channel: { readonly app: string, readonly origin: string },
): ChannelRule | null {
  return rules.find((rule) => matches(rule.match, channel.origin) || matches(rule.match, channel.app)) ?? null
}

function field(key: string, track: TrackFields, url: ParsedUrl | null): string {
  if (key === 'artist' || key === 'title' || key === 'album' || key === 'url') return track[key]
  if (key === 'host') return url?.host ?? ''

  const dot = key.indexOf('.')
  const scope = key.slice(0, dot)
  const name = key.slice(dot + 1)
  if (dot === -1) return ''
  if (scope === 'query') return url?.query[name] ?? ''
  if (scope === 'path') return url?.path.split('/').filter(Boolean)[Number(name)] ?? ''
  return ''
}

export function fillTemplate(template: string, track: TrackFields): string | null {
  const url = parseUrl(track.url)
  let missing = false

  const filled = template.replace(PLACEHOLDER, (_match, key: string) => {
    const value = field(key, track, url)
    if (!value) missing = true
    return encodeURIComponent(value)
  })

  return missing || !filled ? null : filled
}
