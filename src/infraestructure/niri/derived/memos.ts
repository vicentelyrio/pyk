import { Accessor, createMemo } from 'ags'

import type { NiriState } from '../store/state'
import { sameEntries, sameIds, sameWorkspaces } from './equality'
import { selectActiveWindowIds, selectFocusedWindowTitle, selectOccupiedIds } from './selectors'
import { buildWorkspaces } from './workspaces'

export function workspaceMemos(state: Accessor<NiriState>) {
  return {
    workspaces: createMemo(() => buildWorkspaces(state()), { equals: sameWorkspaces }),
    occupiedIds: createMemo(() => selectOccupiedIds(state()), { equals: sameIds }),
    activeWindowIds: createMemo(() => selectActiveWindowIds(state()), { equals: sameEntries }),
    focusedWorkspaceId: createMemo(() => state().focusedWorkspaceId),
    focusedWindowId: createMemo(() => state().focusedWindowId),
    focusedWindowTitle: createMemo(() => selectFocusedWindowTitle(state())),
  }
}
