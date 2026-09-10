import { Option } from 'effect'

export interface Workspace {
  readonly id: number
  readonly idx: number
  readonly name: string | null
  readonly output: string | null
  readonly is_urgent: boolean
  readonly is_active: boolean
  readonly is_focused: boolean
  readonly active_window_id: number | null
}

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

export interface WindowLayout {
  readonly pos_in_scrolling_layout: readonly [number, number] | null
}

export interface NiriWindow {
  readonly id: number
  readonly title: string | null
  readonly app_id: string | null
  readonly workspace_id: number | null
  readonly is_focused: boolean
  readonly is_floating: boolean
  readonly layout: WindowLayout | null
}

export type NiriWorkspaceChangedEvent = {
  readonly kind: 'WorkspacesChanged'
  readonly workspaces: readonly Workspace[]
}

export type NiriWorkspaceActivatedEvent = {
  readonly kind: 'WorkspaceActivated'
  readonly id: number
  readonly focused: boolean
}

export type NiriWorkspaceActiveWindowChangedEvent = {
  readonly kind: 'WorkspaceActiveWindowChanged'
  readonly workspace_id: number
  readonly active_window_id: number | null
}

export type NiriWindowsChangedEvent = {
  readonly kind: 'WindowsChanged'
  readonly windows: readonly NiriWindow[]
}

export type NiriWindowOpenedOrChangedEvent = {
  readonly kind: 'WindowOpenedOrChanged'
  readonly window: NiriWindow
}

export type NiriWindowClosedEvent = {
  readonly kind: 'WindowClosed'
  readonly id: number
}

export type NiriWindowFocusChangedEvent = {
  readonly kind: 'WindowFocusChanged'
  readonly id: number | null
}

export type NiriWindowLayoutsChangedEvent = {
  readonly kind: 'WindowLayoutsChanged'
  readonly changes: readonly (readonly [number, WindowLayout])[]
}

export type NiriEvent =
  NiriWorkspaceChangedEvent |
  NiriWorkspaceActivatedEvent |
  NiriWorkspaceActiveWindowChangedEvent |
  NiriWindowsChangedEvent |
  NiriWindowOpenedOrChangedEvent |
  NiriWindowClosedEvent |
  NiriWindowFocusChangedEvent |
  NiriWindowLayoutsChangedEvent

export function decodeEvent(line: string): Option.Option<NiriEvent> {
  let raw: unknown

  try {
    raw = JSON.parse(line)
  }
  catch {
    return Option.none()
  }

  if (typeof raw !== 'object' || raw === null)
    return Option.none()

  const entry = Object.entries(raw)[0]

  if (!entry || !NiriEventHandled.has(entry[0] as NiriEvent['kind']))
    return Option.none()

  return Option.some({
    kind: entry[0],
    ...(entry[1] as object)
  } as NiriEvent)
}
