import { Schema } from 'effect'

export const NiriWorkspace = Schema.Struct({
  id: Schema.Finite,
  idx: Schema.Finite,
  name: Schema.NullOr(Schema.String),
  output: Schema.NullOr(Schema.String),
  is_urgent: Schema.Boolean,
  is_active: Schema.Boolean,
  is_focused: Schema.Boolean,
  active_window_id: Schema.NullOr(Schema.Finite),
})

export type NiriWorkspace = typeof NiriWorkspace.Type

export const WindowLayout = Schema.Struct({
  pos_in_scrolling_layout: Schema.optional(
    Schema.NullOr(Schema.Tuple([Schema.Finite, Schema.Finite])),
  ),
})

export type WindowLayout = typeof WindowLayout.Type

export const NiriWindow = Schema.Struct({
  id: Schema.Finite,
  title: Schema.NullOr(Schema.String),
  app_id: Schema.NullOr(Schema.String),
  workspace_id: Schema.NullOr(Schema.Finite),
  is_focused: Schema.Boolean,
  is_floating: Schema.Boolean,
  layout: Schema.optional(Schema.NullOr(WindowLayout)),
})

export type NiriWindow = typeof NiriWindow.Type

export const NiriEventKind = {
  WorkspacesChanged: 'WorkspacesChanged',
  WorkspaceActivated: 'WorkspaceActivated',
  WorkspaceActiveWindowChanged: 'WorkspaceActiveWindowChanged',
  WindowsChanged: 'WindowsChanged',
  WindowOpenedOrChanged: 'WindowOpenedOrChanged',
  WindowClosed: 'WindowClosed',
  WindowFocusChanged: 'WindowFocusChanged',
  WindowLayoutsChanged: 'WindowLayoutsChanged',
} as const

export type NiriEventKind = typeof NiriEventKind[keyof typeof NiriEventKind]

export const NiriWorkspaceChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WorkspacesChanged),
  workspaces: Schema.Array(NiriWorkspace),
})

export const NiriWorkspaceActivatedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WorkspaceActivated),
  id: Schema.Finite,
  focused: Schema.Boolean,
})

export const NiriWorkspaceActiveWindowChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WorkspaceActiveWindowChanged),
  workspace_id: Schema.Finite,
  active_window_id: Schema.NullOr(Schema.Finite),
})

export const NiriWindowsChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WindowsChanged),
  windows: Schema.Array(NiriWindow),
})

export const NiriWindowOpenedOrChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WindowOpenedOrChanged),
  window: NiriWindow,
})

export const NiriWindowClosedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WindowClosed),
  id: Schema.Finite,
})

export const NiriWindowFocusChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WindowFocusChanged),
  id: Schema.NullOr(Schema.Finite),
})

export const NiriWindowLayoutsChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WindowLayoutsChanged),
  changes: Schema.Array(Schema.Tuple([Schema.Finite, WindowLayout])),
})

export const NiriEvent = Schema.Union([
  NiriWorkspaceChangedEvent,
  NiriWorkspaceActivatedEvent,
  NiriWorkspaceActiveWindowChangedEvent,
  NiriWindowsChangedEvent,
  NiriWindowOpenedOrChangedEvent,
  NiriWindowClosedEvent,
  NiriWindowFocusChangedEvent,
  NiriWindowLayoutsChangedEvent,
])

export type NiriEvent = typeof NiriEvent.Type

export const NiriEventHandled = new Set<NiriEvent['kind']>(Object.values(NiriEventKind))
