import { configSpec, isLeaf, type Config, type ConfigPatch, type Leaf, type Spec } from '@/infrastructure/config/schema'

export type SectionId =
  | 'appearance'
  | 'scale'
  | 'notifications'
  | 'bar'
  | 'launcher'
  | 'clock'
  | 'wallpaper'
  | 'widgets'
  | 'shortcuts'
  | 'media'
  | 'advanced'

export interface SettingRow {
  readonly path: readonly string[]
  readonly key: string
  readonly leaf: Leaf
  readonly section: SectionId
}

const LAYOUT: ReadonlyArray<readonly [SectionId, readonly string[]]> = [
  ['appearance', ['appearance']],
  ['scale', []],
  ['notifications', ['notifications']],
  ['bar', ['osd', 'popover']],
  ['launcher', ['launcher']],
  ['clock', ['clock', 'calendar', 'schedule']],
  ['wallpaper', ['wallpaper']],
  ['widgets', ['widgets', 'weather', 'todos', 'monitor']],
  ['shortcuts', ['shortcuts']],
  ['media', ['media']],
  ['advanced', ['system']],
]

export const SECTIONS: readonly SectionId[] = LAYOUT.map(([id]) => id)

const SECTION_OF: Readonly<Record<string, SectionId>> = {
  'appearance.fontSize': 'scale',
  'appearance.typeScale': 'scale',
  'appearance.sizeBase': 'scale',
  'appearance.radiusBase': 'scale',
}

export const SECTION_ICONS: Readonly<Record<SectionId, string>> = {
  appearance: 'pyk-appearance-symbolic',
  scale: 'pyk-scale-symbolic',
  notifications: 'pyk-bell-symbolic',
  bar: 'pyk-bar-symbolic',
  launcher: 'pyk-search-symbolic',
  clock: 'pyk-calendar-symbolic',
  wallpaper: 'pyk-image-symbolic',
  widgets: 'pyk-widgets-symbolic',
  shortcuts: 'pyk-keyboard-symbolic',
  media: 'pyk-music-symbolic',
  advanced: 'pyk-advanced-symbolic',
}

function collect(node: Spec, prefix: readonly string[], section: SectionId, into: SettingRow[]): void {
  for (const [name, child] of Object.entries(node)) {
    const path = [...prefix, name]

    if (isLeaf(child)) {
      const key = path.join('.')
      into.push({ path, key, leaf: child, section: SECTION_OF[key] ?? section })
    }
    else collect(child, path, section, into)
  }
}

export const ROWS: readonly SettingRow[] = (() => {
  const out: SettingRow[] = []

  const spec = configSpec as unknown as Spec

  for (const [section, keys] of LAYOUT) {
    for (const key of keys) {
      collect(spec[key] as Spec, [key], section, out)
    }
  }

  return out
})()

export function valueAt(source: Config, path: readonly string[]): unknown {
  let node: unknown = source

  for (const key of path) node = (node as Record<string, unknown>)[key]

  return node
}

export function patchFor(path: readonly string[], value: unknown): ConfigPatch {
  return path.reduceRight<unknown>((nested, key) => ({ [key]: nested }), value) as ConfigPatch
}

export function same(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((it, at) => same(it, b[at]))
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const left = a as Record<string, unknown>
    const right = b as Record<string, unknown>
    const keys = Object.keys(left)

    return keys.length === Object.keys(right).length && keys.every((key) => same(left[key], right[key]))
  }

  return a === b
}
