import AstalNotifd from 'gi://AstalNotifd'

import type {
  Notification,
  NotificationUrgency,
  NotificationsState,
} from '../store/state'

function toUrgency(urgency: AstalNotifd.Urgency): NotificationUrgency {
  switch (urgency) {
    case AstalNotifd.Urgency.LOW:
      return 'low'
    case AstalNotifd.Urgency.CRITICAL:
      return 'critical'
    default:
      return 'normal'
  }
}

function toNotification(notification: AstalNotifd.Notification): Notification {
  return {
    id: notification.id,
    appName: notification.appName ?? '',
    appIcon: notification.appIcon ?? '',
    summary: notification.summary ?? '',
    body: notification.body ?? '',
    image: notification.image ?? '',
    urgency: toUrgency(notification.urgency),
    time: Number(notification.time),
    actions: notification.get_actions().map((action) => ({
      id: action.id,
      label: action.label,
    })),
  }
}

export function snapshot(notifd: AstalNotifd.Notifd): NotificationsState {
  return {
    notifications: notifd
      .get_notifications()
      .map(toNotification)
      .sort((a, b) => b.time - a.time),
    dontDisturb: notifd.dontDisturb,
  }
}
