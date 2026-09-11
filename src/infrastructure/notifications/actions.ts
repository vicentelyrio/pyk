import { dispatch } from '@/infrastructure/runtime'

import { Notifications } from './store'

export function dismiss(id: number): void {
  dispatch(Notifications, (notifications) => notifications.dismiss(id))
}

export function dismissAll(): void {
  dispatch(Notifications, (notifications) => notifications.dismissAll)
}

export function invoke(id: number, action: string): void {
  dispatch(Notifications, (notifications) => notifications.invoke(id, action))
}

export function toggleDontDisturb(): void {
  dispatch(Notifications, (notifications) => notifications.toggleDontDisturb)
}
