import { Schema } from 'effect'

export const NiriWorkspace = Schema.Struct({
  id: Schema.Number,
  idx: Schema.Number,
  name: Schema.NullOr(Schema.String),
  output: Schema.NullOr(Schema.String),
  is_urgent: Schema.Boolean,
  is_active: Schema.Boolean,
  is_focused: Schema.Boolean,
  active_window_id: Schema.NullOr(Schema.Number),
})

export type NiriWorkspace = typeof NiriWorkspace.Type

export const WindowLayout = Schema.Struct({
  pos_in_scrolling_layout: Schema.optionalWith(
    Schema.NullOr(Schema.Tuple(Schema.Number, Schema.Number)),
    { default: () => null },
  ),
})

export type WindowLayout = typeof WindowLayout.Type

export const NiriWindow = Schema.Struct({
  id: Schema.Number,
  title: Schema.NullOr(Schema.String),
  app_id: Schema.NullOr(Schema.String),
  workspace_id: Schema.NullOr(Schema.Number),
  is_focused: Schema.Boolean,
  is_floating: Schema.Boolean,
  layout: Schema.optionalWith(Schema.NullOr(WindowLayout), { default: () => null }),
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

export const NiriEventHandled = new Set<NiriEvent['kind']>(Object.values(NiriEventKind))

export const NiriWorkspaceChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WorkspacesChanged),
  workspaces: Schema.Array(NiriWorkspace),
})

export const NiriWorkspaceActivatedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WorkspaceActivated),
  id: Schema.Number,
  focused: Schema.Boolean,
})

export const NiriWorkspaceActiveWindowChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WorkspaceActiveWindowChanged),
  workspace_id: Schema.Number,
  active_window_id: Schema.NullOr(Schema.Number),
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
  id: Schema.Number,
})

export const NiriWindowFocusChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WindowFocusChanged),
  id: Schema.NullOr(Schema.Number),
})

export const NiriWindowLayoutsChangedEvent = Schema.Struct({
  kind: Schema.Literal(NiriEventKind.WindowLayoutsChanged),
  changes: Schema.Array(Schema.Tuple(Schema.Number, WindowLayout)),
})

export const NiriEvent = Schema.Union(
  NiriWorkspaceChangedEvent,
  NiriWorkspaceActivatedEvent,
  NiriWorkspaceActiveWindowChangedEvent,
  NiriWindowsChangedEvent,
  NiriWindowOpenedOrChangedEvent,
  NiriWindowClosedEvent,
  NiriWindowFocusChangedEvent,
  NiriWindowLayoutsChangedEvent,
)

export type NiriEvent = typeof NiriEvent.Type
