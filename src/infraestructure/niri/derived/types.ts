export interface WorkspaceWindow {
  readonly id: number
  readonly appId: string | null
  readonly title: string | null
  readonly isFloating: boolean
  readonly column: number | null
  readonly tile: number | null
}

export interface Workspace {
  readonly id: number
  readonly idx: number
  readonly name: string | null
  readonly output: string | null
  readonly isUrgent: boolean
  readonly windows: readonly WorkspaceWindow[]
}
