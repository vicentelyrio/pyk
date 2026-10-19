import type Gio from 'gi://Gio'

export interface TrayEntry {
  readonly id: string
  readonly title: string
  readonly tooltip: string
  readonly gicon: Gio.Icon
  readonly isMenu: boolean
  readonly menuModel: Gio.MenuModel | null
  readonly actionGroup: Gio.ActionGroup | null
}

export interface TrayState {
  readonly items: readonly TrayEntry[]
}

export const emptyState: TrayState = {
  items: [],
}
