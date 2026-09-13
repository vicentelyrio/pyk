import AstalApps from 'gi://AstalApps'

import type { AppEntry, AppsState } from '../store/state'

function toEntry(app: AstalApps.Application): AppEntry {
  return {
    id: app.entry,
    name: app.name ?? '',
    description: app.description ?? '',
    executable: app.executable ?? '',
    iconName: app.iconName ?? '',
    keywords: app.keywords ?? [],
    categories: app.categories ?? [],
    frequency: app.frequency,
  }
}

export function snapshot(apps: AstalApps.Apps): AppsState {
  return {
    apps: apps.get_list().map(toEntry),
  }
}
