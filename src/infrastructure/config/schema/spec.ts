export type Apply = 'live' | 'restart'

interface LeafBase<K extends string, T> {
  readonly kind: K
  readonly default: T
  readonly apply: Apply
}

export interface NumberLeaf extends LeafBase<'number', number> {
  readonly min: number
  readonly max: number
  readonly unit?: 'px' | 'ms'
}

export type ColorLeaf = LeafBase<'color', string>
export type TextLeaf = LeafBase<'text', string>
export type ToggleLeaf = LeafBase<'toggle', boolean>

export interface ChoiceLeaf<T extends string> extends LeafBase<'choice', T> {
  readonly options: readonly T[]
}

export type Leaf = NumberLeaf | ColorLeaf | TextLeaf | ToggleLeaf | ChoiceLeaf<string>

export interface Spec {
  readonly [key: string]: Leaf | Spec
}

export type Value<S> =
  S extends ChoiceLeaf<infer T> ? T
    : S extends NumberLeaf ? number
      : S extends ToggleLeaf ? boolean
        : S extends ColorLeaf | TextLeaf ? string
          : S extends Spec ? { readonly [K in keyof S]: Value<S[K]> }
            : never

export type Patch<T> = T extends object ? { readonly [K in keyof T]?: Patch<T[K]> } : T

type Options = { readonly apply?: Apply }

export function number(
  fallback: number,
  range: { readonly min: number, readonly max: number, readonly unit?: 'px' | 'ms' } & Options,
): NumberLeaf {
  return { kind: 'number', default: fallback, apply: range.apply ?? 'live', ...range }
}

export function color(fallback: string, options: Options = {}): ColorLeaf {
  return { kind: 'color', default: fallback, apply: options.apply ?? 'live' }
}

export function text(fallback: string, options: Options = {}): TextLeaf {
  return { kind: 'text', default: fallback, apply: options.apply ?? 'live' }
}

export function toggle(fallback: boolean, options: Options = {}): ToggleLeaf {
  return { kind: 'toggle', default: fallback, apply: options.apply ?? 'live' }
}

export function choice<const T extends string>(
  options: readonly T[],
  fallback: NoInfer<T>,
  extra: Options = {},
): ChoiceLeaf<T> {
  return { kind: 'choice', default: fallback, options, apply: extra.apply ?? 'live' }
}

const HEX = /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i

function isLeaf(node: Leaf | Spec): node is Leaf {
  return typeof node.kind === 'string'
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

function accepts(leaf: Leaf, input: unknown): boolean {
  switch (leaf.kind) {
    case 'number':
      return typeof input === 'number' && Number.isFinite(input) && input >= leaf.min && input <= leaf.max
    case 'color':
      return typeof input === 'string' && HEX.test(input)
    case 'text':
      return typeof input === 'string' && input.trim().length > 0
    case 'toggle':
      return typeof input === 'boolean'
    case 'choice':
      return typeof input === 'string' && leaf.options.includes(input)
  }
}

export interface Decoded<S extends Spec> {
  readonly value: Value<S>
  readonly issues: readonly string[]
}

export function decode<S extends Spec>(spec: S, input: unknown): Decoded<S> {
  const issues: string[] = []

  const walk = (node: Spec, raw: unknown, path: string): Record<string, unknown> => {
    const source = isRecord(raw) ? raw : {}
    if (raw !== undefined && !isRecord(raw)) issues.push(`${path || '<root>'}: expected an object`)

    for (const key of Object.keys(source)) {
      if (!(key in node)) issues.push(`${path}${key}: unknown key`)
    }

    const out: Record<string, unknown> = {}

    for (const [key, child] of Object.entries(node)) {
      const at = `${path}${key}`

      if (!isLeaf(child)) {
        out[key] = walk(child, source[key], `${at}.`)
        continue
      }

      if (source[key] === undefined) {
        out[key] = child.default
      }
      else if (accepts(child, source[key])) {
        out[key] = source[key]
      }
      else {
        issues.push(`${at}: invalid value ${JSON.stringify(source[key])}`)
        out[key] = child.default
      }
    }

    return out
  }

  return { value: walk(spec, input, '') as Value<S>, issues }
}

export function defaults<S extends Spec>(spec: S): Value<S> {
  return decode(spec, {}).value
}

export function merge<T>(base: T, patch: Patch<T>): T {
  if (!isRecord(base) || !isRecord(patch)) return (patch === undefined ? base : patch) as T

  const out: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) out[key] = merge(out[key], value as never)
  }

  return out as T
}

export function overrides<S extends Spec>(spec: S, value: Value<S>): Patch<Value<S>> {
  const walk = (node: Spec, current: Record<string, unknown>): Record<string, unknown> | undefined => {
    const out: Record<string, unknown> = {}

    for (const [key, child] of Object.entries(node)) {
      if (isLeaf(child)) {
        if (current[key] !== child.default) out[key] = current[key]
        continue
      }

      const nested = walk(child, current[key] as Record<string, unknown>)
      if (nested) out[key] = nested
    }

    return Object.keys(out).length > 0 ? out : undefined
  }

  return (walk(spec, value as Record<string, unknown>) ?? {}) as Patch<Value<S>>
}
