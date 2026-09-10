import { Effect } from 'effect'

import { runtime } from './bridge'
import { Niri } from './controller'

type NiriAction = (niri: Niri) => Effect.Effect<unknown, unknown>

function dispatch(action: NiriAction): void {
  runtime.runFork(
    Effect.flatMap(Niri, action).pipe(Effect.catchAll((error) => Effect.logError(error))),
  )
}

export function focusWorkspace(reference: number | string): void {
  dispatch((niri) => niri.focusWorkspace(reference))
}

export function focusWorkspaceUp(): void {
  dispatch((niri) => niri.action('focus-workspace-up'))
}

export function focusWorkspaceDown(): void {
  dispatch((niri) => niri.action('focus-workspace-down'))
}

export function focusColumnLeft(): void {
  dispatch((niri) => niri.action('focus-column-left'))
}

export function focusColumnRight(): void {
  dispatch((niri) => niri.action('focus-column-right'))
}

export function focusWindow(id: number): void {
  dispatch((niri) => niri.action('focus-window', '--id', String(id)))
}
