export interface Accelerator {
  readonly key: string
  readonly ctrl: boolean
  readonly alt: boolean
  readonly shift: boolean
  readonly super: boolean
}

const MODIFIERS: Record<string, keyof Omit<Accelerator, 'key'>> = {
  mod: 'super',
  super: 'super',
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  shift: 'shift',
}

export function parse(shortcut: string): Accelerator | null {
  const parts = shortcut.split('+')
  const key = parts.pop()
  if (!key) return null

  const accelerator = { key, ctrl: false, alt: false, shift: false, super: false }

  for (const part of parts) {
    const modifier = MODIFIERS[part.toLowerCase()]
    if (!modifier) return null
    accelerator[modifier] = true
  }

  return accelerator
}

export function format(accelerator: Accelerator): string {
  const parts: string[] = []

  if (accelerator.super) parts.push('Mod')
  if (accelerator.ctrl) parts.push('Ctrl')
  if (accelerator.alt) parts.push('Alt')
  if (accelerator.shift) parts.push('Shift')

  parts.push(accelerator.key)

  return parts.join('+')
}
