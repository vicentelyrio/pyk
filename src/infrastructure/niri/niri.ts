import {
  focusColumnLeft,
  focusColumnRight,
  focusWindow,
  focusWorkspace,
  focusWorkspaceDown,
  focusWorkspaceUp,
  screenshot,
  toggleOverview,
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
  screenshot,
  toggleOverview,
} as const
