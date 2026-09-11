import { dispatch } from '@/infraestructure/runtime'

import { Niri } from './store'

export function focusWorkspace(reference: number | string): void {
  dispatch(Niri, (niri) => niri.focusWorkspace(reference))
}

export function focusWorkspaceUp(): void {
  dispatch(Niri, (niri) => niri.action('focus-workspace-up'))
}

export function focusWorkspaceDown(): void {
  dispatch(Niri, (niri) => niri.action('focus-workspace-down'))
}

export function focusColumnLeft(): void {
  dispatch(Niri, (niri) => niri.action('focus-column-left'))
}

export function focusColumnRight(): void {
  dispatch(Niri, (niri) => niri.action('focus-column-right'))
}

export function focusWindow(id: number): void {
  dispatch(Niri, (niri) => niri.action('focus-window', '--id', String(id)))
}
