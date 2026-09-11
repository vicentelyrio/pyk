import AstalNotifd from 'gi://AstalNotifd'
import { Schedule, Stream } from 'effect'

import { fromSignal, logFailure, type SourceError } from '@/infrastructure/effect'

import type { NotificationsState } from '../store/state'
import { snapshot } from './notifications'

const reconnect = Schedule.spaced('5 seconds').pipe(Schedule.jittered)

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
    Stream.tapError((error) => logFailure(error)),
    Stream.retry(reconnect),
  )
}
