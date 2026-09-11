import { Accessor, createMemo } from 'ags'

import type { NiriWindow } from '../schema'
import type { NiriState } from '../store/state'
import type { WorkspaceWindow, Workspace } from './types'
import { sameEntries, sameIds, sameWorkspaces } from './equality'
import { selectActiveWindowIds, selectFocusedWindowTitle, selectOccupiedIds } from './selectors'

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

function buildWorkspaces(state: NiriState): readonly Workspace[] {
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

export function workspaces(state: Accessor<NiriState>) {
  return {
    workspaces: createMemo(() => buildWorkspaces(state()), { equals: sameWorkspaces }),
    occupiedIds: createMemo(() => selectOccupiedIds(state()), { equals: sameIds }),
    activeWindowIds: createMemo(() => selectActiveWindowIds(state()), { equals: sameEntries }),
    focusedWorkspaceId: createMemo(() => state().focusedWorkspaceId),
    focusedWindowId: createMemo(() => state().focusedWindowId),
    focusedWindowTitle: createMemo(() => selectFocusedWindowTitle(state())),
  }
}
