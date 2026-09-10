import { createMemo } from 'ags'

import { niriState } from './bridge'

import { sameEntries, sameIds, sameWorkspaces } from './equality'

import { buildWorkspaces } from './workspaces'

import {
  selectActiveWindowIds,
  selectFocusedWindowTitle,
  selectOccupiedIds
} from './selectors'

import {
  focusColumnLeft,
  focusColumnRight,
  focusWindow,
  focusWorkspace,
  focusWorkspaceDown,
  focusWorkspaceUp,
} from './actions'

export const niri = {
  workspaces: createMemo(() => buildWorkspaces(niriState()), { equals: sameWorkspaces }),
  occupiedIds: createMemo(() => selectOccupiedIds(niriState()), { equals: sameIds }),
  activeWindowIds: createMemo(() => selectActiveWindowIds(niriState()), { equals: sameEntries }),
  focusedWorkspaceId: createMemo(() => niriState().focusedWorkspaceId),
  focusedWindowId: createMemo(() => niriState().focusedWindowId),
  focusedWindowTitle: createMemo(() => selectFocusedWindowTitle(niriState())),
  focusWorkspace,
  focusWorkspaceUp,
  focusWorkspaceDown,
  focusColumnLeft,
  focusColumnRight,
  focusWindow,
} as const
