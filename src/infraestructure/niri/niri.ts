import {
  focusColumnLeft,
  focusColumnRight,
  focusWindow,
  focusWorkspace,
  focusWorkspaceDown,
  focusWorkspaceUp,
} from './actions'
import { niriState } from './bridge'
import { workspaceMemos } from './derived/memos'

export const niri = {
  ...workspaceMemos(niriState),
  focusWorkspace,
  focusWorkspaceUp,
  focusWorkspaceDown,
  focusColumnLeft,
  focusColumnRight,
  focusWindow,
} as const
