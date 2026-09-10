import { createMemo } from 'ags'

import { niriState } from './bridge'

import { sameEntries, sameIds, sameLanes, sameShape } from './equality'

import { buildLanes } from './lanes'

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
  workspaces: createMemo(() => niriState().workspaces, { equals: sameShape }),
  lanes: createMemo(() => buildLanes(niriState()), { equals: sameLanes }),
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
