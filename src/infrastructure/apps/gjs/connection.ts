import AstalApps from 'gi://AstalApps'
import { Stream } from 'effect'

import { fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import type { AppsState } from '../store/state'
import { snapshot } from './apps'

export function stateChanges(apps: AstalApps.Apps): Stream.Stream<AppsState, SourceError> {
  return fromSignal('apps', apps, 'notify::list', () => snapshot(apps)).pipe(reconnecting)
}
