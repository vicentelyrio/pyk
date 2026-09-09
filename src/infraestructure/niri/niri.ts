import { createMemo } from 'ags'
import { Effect } from 'effect'

import { niriState, sameIds, sameShape, runtime } from './bridge'
import { Niri } from './controller'

export const niri = {
  workspaces: createMemo(() => niriState().workspaces, { equals: sameShape }),
  occupiedIds: createMemo(() => (
    new Set(
      niriState()
      .workspaces.filter((w) => w.active_window_id !== null)
      .map((w) => w.id),
    )),
    { equals: sameIds },
  ),
  focusedWorkspaceId: createMemo(() => niriState().focusedWorkspaceId),
  focusedWindowTitle: createMemo(() => {
    const { windows, focusedWindowId } = niriState()
    return focusedWindowId === null ? '' : (windows.get(focusedWindowId)?.title ?? '')
  }),
  focusWorkspace(reference: number | string): void {
    runtime.runFork(
      Effect.flatMap(Niri, (n) => n.focusWorkspace(reference)).pipe(
        Effect.catchAll((error) => Effect.logError(error)),
      ),
    )
  },
} as const
