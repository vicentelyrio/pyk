export type NotificationUrgency = 'low' | 'normal' | 'critical'

export interface NotificationAction {
  readonly id: string
  readonly label: string
}

export interface Notification {
  readonly id: number
  readonly appName: string
  readonly appIcon: string
  readonly summary: string
  readonly body: string
  readonly image: string
  readonly urgency: NotificationUrgency
  readonly time: number
  readonly actions: readonly NotificationAction[]
}

export interface NotificationsState {
  readonly notifications: readonly Notification[]
  readonly dontDisturb: boolean
}

export const emptyState: NotificationsState = {
  notifications: [],
  dontDisturb: false,
}
