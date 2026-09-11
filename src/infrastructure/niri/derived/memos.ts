import { Accessor, createMemo } from 'ags'
import { Equal } from 'effect'

import type { NiriState } from '../store/state'
import { selectFocusedWindowTitle, selectOccupiedIds } from './selectors'
import { buildWorkspaces } from './workspaces'

export function workspaceMemos(state: Accessor<NiriState>) {
  return {
    workspaces: createMemo(() => buildWorkspaces(state()), { equals: Equal.equals }),
    occupiedIds: createMemo(() => selectOccupiedIds(state()), { equals: Equal.equals }),
    focusedWorkspaceId: createMemo(() => state().focusedWorkspaceId),
    focusedWindowId: createMemo(() => state().focusedWindowId),
    focusedWindowTitle: createMemo(() => selectFocusedWindowTitle(state())),
  }
}
