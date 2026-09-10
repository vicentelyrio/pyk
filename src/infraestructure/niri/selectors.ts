import type { NiriState } from './state'

export function selectOccupiedIds(state: NiriState): ReadonlySet<number> {
  return new Set(
    state.workspaces.filter((w) => w.active_window_id !== null).map((w) => w.id),
  )
}

export function selectActiveWindowIds(state: NiriState): ReadonlyMap<number, number> {
  const active = new Map<number, number>()

  for (const workspace of state.workspaces) {
    if (workspace.active_window_id === null) continue
    active.set(workspace.id, workspace.active_window_id)
  }

  return active
}

export function selectFocusedWindowTitle(state: NiriState): string {
  const { windows, focusedWindowId } = state

  if (focusedWindowId === null) return ''

  return windows.get(focusedWindowId)?.title ?? ''
}
