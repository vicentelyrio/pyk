export function rows<T>(items: readonly T[], columns: number): readonly (readonly T[])[] {
  const out: T[][] = []
  for (let at = 0; at < items.length; at += columns) out.push(items.slice(at, at + columns))
  return out
}
