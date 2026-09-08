import GObject, { register, property } from 'ags/gobject'
import { exec, subprocess } from 'ags/process'

// Partial shape of a niri `Workspace` from `niri msg --json event-stream`.
export interface Workspace {
  id: number
  idx: number
  name: string | null
  output: string | null
  is_active: boolean
  is_focused: boolean
}

@register({ GTypeName: 'Niri' })
export class Niri extends GObject.Object {
  static instance: Niri
  static get_default() { return (this.instance ??= new Niri()) }

  @property(Object) workspaces: Workspace[] = []
  @property(String) focusedTitle = ''

  constructor() {
    super()
    subprocess({
      cmd: ['niri', 'msg', '--json', 'event-stream'],
      out: (line) => this.#handle(JSON.parse(line)),
      err: (e) => console.error('niri ipc:', e),
    })
  }

  #handle(ev: any) {
    if ('WorkspacesChanged' in ev) this.workspaces = ev.WorkspacesChanged.workspaces
    if ('WorkspaceActivated' in ev) { /* flip is_active, notify */ }
    if ('WindowFocusChanged' in ev) { /* look up title */ }
  }

  focusWorkspace(id: number) {
    exec(['niri', 'msg', 'action', 'focus-workspace', String(id)])
  }
}
