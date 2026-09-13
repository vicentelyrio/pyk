export interface AppEntry {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly executable: string
  readonly iconName: string
  readonly keywords: readonly string[]
  readonly categories: readonly string[]
  readonly frequency: number
}

export interface AppsState {
  readonly apps: readonly AppEntry[]
}

export const emptyState: AppsState = {
  apps: [],
}
