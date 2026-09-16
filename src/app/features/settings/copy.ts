import { LL } from '@/infrastructure/i18n'

import type { SectionId } from './catalog'

type Entry = {
  readonly label: () => string
  readonly hint: () => string
}

export interface Copy {
  readonly label: string
  readonly hint: string
}

export function copyFor(path: readonly string[]): Copy {
  let node: unknown = LL().settings

  for (const key of path) node = (node as Record<string, unknown>)[key]

  const entry = node as Entry

  return { label: entry.label(), hint: entry.hint() }
}

export function sectionTitle(id: SectionId): string {
  const titles = LL().settings.sections as unknown as Record<SectionId, () => string>

  return titles[id]()
}
