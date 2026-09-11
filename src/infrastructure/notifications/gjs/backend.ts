import AstalNotifd from 'gi://AstalNotifd'
import { Layer } from 'effect'

import { attempt } from '@/infrastructure/effect'

import { NotificationsBackend } from '../store/backend'
import { stateChanges } from './connection'

export const NotificationsBackendLive = Layer.sync(NotificationsBackend, () => {
  const notifd = AstalNotifd.get_default()

  return {
    changes: stateChanges(notifd),
    dismiss: (id: number) =>
      attempt('notifications', 'dismiss', () => {
        notifd.get_notification(id)?.dismiss()
      }),
    dismissAll: attempt('notifications', 'dismissAll', () => {
      for (const notification of notifd.get_notifications()) notification.dismiss()
    }),
    invoke: (id: number, action: string) =>
      attempt('notifications', 'invoke', () => {
        notifd.get_notification(id)?.invoke(action)
      }),
    toggleDontDisturb: attempt('notifications', 'toggleDontDisturb', () => {
      notifd.dontDisturb = !notifd.dontDisturb
    }),
  }
})
