import type { Workspace } from './protocol'
import type { LaneWindow, WorkspaceLane } from './lanes'

export function sameIds(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
  return a.size === b.size && [...a].every((id) => b.has(id))
}

export function sameEntries(
  a: ReadonlyMap<number, number>,
  b: ReadonlyMap<number, number>,
): boolean {
  if (a.size !== b.size) return false

  for (const [key, value] of a) {
    if (b.get(key) !== value) return false
  }

  return true
}

function sameWorkspace(a: Workspace, b: Workspace): boolean {
  return a.id === b.id && a.idx === b.idx && a.name === b.name && a.output === b.output
}

export function sameShape(a: readonly Workspace[], b: readonly Workspace[]): boolean {
  return a.length === b.length && a.every((workspace, i) => sameWorkspace(workspace, b[i]))
}

function sameLaneWindow(a: LaneWindow, b: LaneWindow): boolean {
  return (
    a.id === b.id &&
    a.column === b.column &&
    a.tile === b.tile &&
    a.isFloating === b.isFloating
  )
}

function sameLane(a: WorkspaceLane, b: WorkspaceLane): boolean {
  return (
    a.id === b.id &&
    a.idx === b.idx &&
    a.isUrgent === b.isUrgent &&
    a.windows.length === b.windows.length &&
    a.windows.every((window, i) => sameLaneWindow(window, b.windows[i]))
  )
}

export function sameLanes(a: readonly WorkspaceLane[], b: readonly WorkspaceLane[]): boolean {
  return a.length === b.length && a.every((lane, i) => sameLane(lane, b[i]))
}
