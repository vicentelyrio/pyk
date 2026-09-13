import type { ShortcutsConfig } from '@/infrastructure/config/schema'

type GlobalAction = keyof ShortcutsConfig['global']

export const globalActions: Record<GlobalAction, { readonly title: string, readonly request: readonly string[] }> = {
  launcher: { title: 'Toggle launcher', request: ['launcher'] },
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function renderBinds(global: ShortcutsConfig['global'], instance: string): string {
  const seen = new Set<string>()
  const lines: string[] = []

  for (const [action, keys] of Object.entries(global) as [GlobalAction, readonly string[]][]) {
    const { title, request } = globalActions[action]
    const spawn = ['ags', 'request', '-i', instance, ...request].map(quote).join(' ')

    for (const key of keys) {
      const id = key.toLowerCase()
      if (seen.has(id)) continue
      seen.add(id)
      lines.push(`    ${key} hotkey-overlay-title=${quote(title)} { spawn ${spawn}; }`)
    }
  }

  return lines.length > 0 ? `binds {\n${lines.join('\n')}\n}\n` : ''
}
