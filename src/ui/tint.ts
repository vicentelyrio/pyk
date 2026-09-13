export const TINTS = ['--accent', '--info', '--ok', '--warn', '--attention'] as const

export type Tint = (typeof TINTS)[number]

export function tintFor(name: string): Tint {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % TINTS.length
  return TINTS[hash]!
}
