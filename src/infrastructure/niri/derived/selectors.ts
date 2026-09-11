import type { NiriState } from '../store/state'

export function selectOccupiedIds(state: NiriState): ReadonlySet<number> {
  return new Set(
    state.workspaces.filter((w) => w.active_window_id !== null).map((w) => w.id),
  )
}

export function selectFocusedWindowTitle(state: NiriState): string {
  const { windows, focusedWindowId } = state

  if (focusedWindowId === null) return ''

  return windows.get(focusedWindowId)?.title ?? ''
}
