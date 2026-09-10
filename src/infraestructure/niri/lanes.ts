import type { NiriState } from './state'
import type { NiriWindow } from './protocol'

export interface LaneWindow {
  readonly id: number
  readonly appId: string | null
  readonly title: string | null
  readonly isFloating: boolean
  readonly column: number | null
  readonly tile: number | null
}

export interface WorkspaceLane {
  readonly id: number
  readonly idx: number
  readonly name: string | null
  readonly output: string | null
  readonly isUrgent: boolean
  readonly windows: readonly LaneWindow[]
}

function groupByWorkspace(windows: ReadonlyMap<number, NiriWindow>): Map<number, NiriWindow[]> {
  const grouped = new Map<number, NiriWindow[]>()

  for (const window of windows.values()) {
    if (window.workspace_id === null) continue
    const group = grouped.get(window.workspace_id)
    if (group) group.push(window)
    else grouped.set(window.workspace_id, [window])
  }

  return grouped
}

function byScrollPosition(a: NiriWindow, b: NiriWindow): number {
  const left = a.layout?.pos_in_scrolling_layout ?? null
  const right = b.layout?.pos_in_scrolling_layout ?? null

  if (!left || !right) return left ? -1 : right ? 1 : a.id - b.id

  return left[0] - right[0] || left[1] - right[1]
}

function toLaneWindow(window: NiriWindow): LaneWindow {
  const pos = window.layout?.pos_in_scrolling_layout ?? null

  return {
    id: window.id,
    appId: window.app_id,
    title: window.title,
    isFloating: window.is_floating,
    column: pos?.[0] ?? null,
    tile: pos?.[1] ?? null,
  }
}

export function buildLanes(state: NiriState): readonly WorkspaceLane[] {
  const grouped = groupByWorkspace(state.windows)

  return state.workspaces.map((workspace) => ({
    id: workspace.id,
    idx: workspace.idx,
    name: workspace.name,
    output: workspace.output,
    isUrgent: workspace.is_urgent,
    windows: (grouped.get(workspace.id) ?? []).sort(byScrollPosition).map(toLaneWindow),
  }))
}
