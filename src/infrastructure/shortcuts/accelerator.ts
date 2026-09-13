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
