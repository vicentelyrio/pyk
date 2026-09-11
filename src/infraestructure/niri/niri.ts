import {
  focusColumnLeft,
  focusColumnRight,
  focusWindow,
  focusWorkspace,
  focusWorkspaceDown,
  focusWorkspaceUp,
  niriState,
} from './store'

import { workspaces } from './derived'

export const niri = {
  ...workspaces(niriState),
  focusWorkspace,
  focusWorkspaceUp,
  focusWorkspaceDown,
  focusColumnLeft,
  focusColumnRight,
  focusWindow,
} as const
