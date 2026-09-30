import { score } from '@/infrastructure/apps/derived/search'

import type { FileHit } from '../store/state'

function depth(path: string): number {
  return path.split('/').length
}

export function rank(hits: readonly FileHit[], query: string, limit: number): readonly FileHit[] {
  const needle = query.trim().toLowerCase()

  return hits
    .map((hit) => ({ hit, relevance: score(hit.name, needle, false) }))
    .sort((a, b) =>
      b.relevance - a.relevance
      || depth(a.hit.path) - depth(b.hit.path)
      || Number(b.hit.isDirectory) - Number(a.hit.isDirectory)
      || a.hit.path.localeCompare(b.hit.path))
    .slice(0, limit)
    .map((it) => it.hit)
}
