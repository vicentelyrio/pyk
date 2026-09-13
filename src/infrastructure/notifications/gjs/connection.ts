import AstalNotifd from 'gi://AstalNotifd'
import { Stream } from 'effect'

import { fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import type { NotificationsState } from '../store/state'
import { snapshot } from './notifications'

export function stateChanges(
  notifd: AstalNotifd.Notifd,
): Stream.Stream<NotificationsState, SourceError> {
  const snap = () => snapshot(notifd)

  return Stream.mergeAll(
    [
      fromSignal('notifications', notifd, 'notified', snap),
      fromSignal('notifications', notifd, 'resolved', snap),
      fromSignal('notifications', notifd, 'notify::dont-disturb', snap),
    ],
    { concurrency: 'unbounded' },
  ).pipe(
    reconnecting,
  )
}
