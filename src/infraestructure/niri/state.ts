import {
  NiriEventKind,
  type NiriWorkspace,
  type NiriEvent,
  type NiriWindow,
} from './protocol'

export interface NiriState {
  readonly workspaces: readonly NiriWorkspace[]
  readonly focusedWorkspaceId: number
  readonly windows: ReadonlyMap<number, NiriWindow>
  readonly focusedWindowId: number | null
}

export const emptyState: NiriState = {
  workspaces: [],
  focusedWorkspaceId: -1,
  windows: new Map(),
  focusedWindowId: null,
}

export function reduce(state: NiriState, event: NiriEvent): NiriState {
  switch (event.kind) {
    // Workspace Changed
    case NiriEventKind.WorkspacesChanged: {
      const workspaces = [...event.workspaces].sort(
        (a, b) => (a.output ?? '').localeCompare(b.output ?? '') || a.idx - b.idx,
      )
      const focused = workspaces.find((w) => w.is_focused)
      return {
        ...state,
        workspaces,
        focusedWorkspaceId: focused?.id ?? state.focusedWorkspaceId,
      }
    }

    // Workspace Activated
    case NiriEventKind.WorkspaceActivated:
      return event.focused ? { ...state, focusedWorkspaceId: event.id } : state

    // Workspace Active Window Changed
    case NiriEventKind.WorkspaceActiveWindowChanged: {
      const i = state.workspaces.findIndex((w) => w.id === event.workspace_id)
      if (i === -1 || state.workspaces[i].active_window_id === event.active_window_id) {
        return state
      }
      const workspaces = state.workspaces.slice()
      workspaces[i] = { ...workspaces[i], active_window_id: event.active_window_id }
      return { ...state, workspaces }
    }

    // Window Changed
    case NiriEventKind.WindowsChanged: {
      const windows = new Map(event.windows.map((w) => [w.id, w] as const))
      const focused = event.windows.find((w) => w.is_focused)
      return { ...state, windows, focusedWindowId: focused?.id ?? null }
    }

    // Window Opened or Changed
    case NiriEventKind.WindowOpenedOrChanged: {
      const window = event.window
      return {
        ...state,
        windows: new Map(state.windows).set(window.id, window),
        focusedWindowId: window.is_focused ? window.id : state.focusedWindowId,
      }
    }

    // Window Closed
    case NiriEventKind.WindowClosed: {
      if (!state.windows.has(event.id)) return state
      const windows = new Map(state.windows)
      windows.delete(event.id)
      return {
        ...state,
        windows,
        focusedWindowId: state.focusedWindowId === event.id ? null : state.focusedWindowId,
      }
    }

    // Window Focus Changed
    case NiriEventKind.WindowFocusChanged:
      return { ...state, focusedWindowId: event.id }

    // Window Layouts Changed
    case NiriEventKind.WindowLayoutsChanged: {
      const windows = new Map(state.windows)
      let touched = false
      for (const [id, layout] of event.changes) {
        const window = windows.get(id)
        if (!window) continue
        windows.set(id, { ...window, layout })
        touched = true
      }
      return touched ? { ...state, windows } : state
    }
  }
}
