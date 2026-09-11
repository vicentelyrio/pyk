import type { NiriWindow } from '../schema'
import type { NiriState } from '../store/state'
import type { WorkspaceWindow, Workspace } from './types'

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

export function byScrollPosition(a: NiriWindow, b: NiriWindow): number {
  const left = a.layout?.pos_in_scrolling_layout ?? null
  const right = b.layout?.pos_in_scrolling_layout ?? null

  if (!left || !right) return left ? -1 : right ? 1 : a.id - b.id

  return left[0] - right[0] || left[1] - right[1]
}

function toWorkspaceWindow(window: NiriWindow): WorkspaceWindow {
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

export function buildWorkspaces(state: NiriState): readonly Workspace[] {
  const grouped = groupByWorkspace(state.windows)

  return state.workspaces.map((workspace) => ({
    id: workspace.id,
    idx: workspace.idx,
    name: workspace.name,
    output: workspace.output,
    isUrgent: workspace.is_urgent,
    windows: (grouped.get(workspace.id) ?? []).sort(byScrollPosition).map(toWorkspaceWindow),
  }))
}
