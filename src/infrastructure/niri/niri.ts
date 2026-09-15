import {
  focusColumnLeft,
  focusColumnRight,
  focusWindow,
  focusWorkspace,
  focusWorkspaceDown,
  focusWorkspaceUp,
  quit,
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
  quit,
  screenshot,
  toggleOverview,
} as const
