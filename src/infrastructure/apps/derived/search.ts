import type { AppEntry } from '../store/state'

const NAME = 1
const KEYWORD = 0.6
const EXECUTABLE = 0.5
const DESCRIPTION = 0.3

const KINDS: ReadonlyArray<readonly [string, string]> = [
  ['TerminalEmulator', 'terminal'],
  ['WebBrowser', 'web'],
  ['FileManager', 'files'],
  ['TextEditor', 'editor'],
  ['IDE', 'editor'],
  ['Development', 'dev'],
  ['Game', 'games'],
  ['Graphics', 'graphics'],
  ['Audio', 'audio'],
  ['Video', 'video'],
  ['AudioVideo', 'media'],
  ['Office', 'office'],
  ['Education', 'education'],
  ['Science', 'science'],
  ['Network', 'network'],
  ['Settings', 'settings'],
  ['System', 'system'],
  ['Utility', 'utility'],
]

export function kind(app: AppEntry): string {
  return KINDS.find(([category]) => app.categories.includes(category))?.[1] ?? 'app'
}

export function score(text: string, query: string, fuzzy = true): number {
  const haystack = text.toLowerCase()
  if (!haystack || !query) return 0

  const at = haystack.indexOf(query)
  if (at === 0) return 3
  if (at > 0) return /[\s\-_.]/.test(haystack[at - 1]!) ? 2.5 : 2
  if (!fuzzy) return 0

  let from = 0
  let gaps = 0

  for (const char of query) {
    const found = haystack.indexOf(char, from)
    if (found < 0) return 0
    gaps += found - from
    from = found + 1
  }

  if (gaps > query.length) return 0

  return 1 / (1 + gaps / query.length)
}

function relevance(app: AppEntry, query: string): number {
  return Math.max(
    score(app.name, query) * NAME,
    ...app.keywords.map((keyword) => score(keyword, query, false) * KEYWORD),
    score(app.executable, query, false) * EXECUTABLE,
    score(app.description, query, false) * DESCRIPTION,
  )
}

export function search(apps: readonly AppEntry[], query: string, limit: number): readonly AppEntry[] {
  const needle = query.trim().toLowerCase()

  if (!needle) {
    return [...apps]
      .sort((a, b) => b.frequency - a.frequency || a.name.localeCompare(b.name))
      .slice(0, limit)
  }

  return apps
    .map((app) => ({ app, relevance: relevance(app, needle) }))
    .filter((it) => it.relevance > 0)
    .sort((a, b) =>
      b.relevance - a.relevance
      || b.app.frequency - a.app.frequency
      || a.app.name.localeCompare(b.app.name))
    .slice(0, limit)
    .map((it) => it.app)
}
