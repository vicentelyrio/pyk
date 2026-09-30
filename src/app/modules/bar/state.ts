import GLib from 'gi://GLib'
import app from 'ags/gtk4/app'
import { createState } from 'ags'
import { niri } from '@/infrastructure/niri'

export type BarSurface = 'control' | 'wifi' | 'bluetooth' | 'wallpaper' | 'notifications' | 'calendar' | 'session'

export interface BarRequest {
  readonly surface: BarSurface
  readonly output: string
}

const SETTLE = 200

const [request, setRequest] = createState<BarRequest | null>(null)

function focusedOutput(): string {
  const focused = niri.workspaces().find((it) => it.id === niri.focusedWorkspaceId())
  return focused?.output ?? app.get_monitors()[0]?.connector ?? ''
}

export const bar = {
  request,
  reveal: (surface: BarSurface) => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, SETTLE, () => {
      setRequest({ surface, output: focusedOutput() })
      return GLib.SOURCE_REMOVE
    })
  },
} as const
