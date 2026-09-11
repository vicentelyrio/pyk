import { NiriWindow, NiriWorkspace } from '../schema'

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

