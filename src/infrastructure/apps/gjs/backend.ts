import AstalApps from 'gi://AstalApps'
import { Effect, Layer } from 'effect'

import { attempt } from '@/infrastructure/effect'

import { AppsBackend } from '../store/backend'
import { stateChanges } from './connection'

export const AppsBackendLive = Layer.sync(AppsBackend, () => {
  const apps = new AstalApps.Apps()

  return {
    changes: stateChanges(apps),
    launch: (id: string) =>
      attempt('apps', 'launch', () => {
        const app = apps.get_list().find((it) => it.entry === id)
        if (!app) throw new Error(`no desktop entry ${id}`)
        if (!app.launch()) throw new Error(`${id} failed to launch`)
      }).pipe(
        Effect.tap(() => Effect.sync(() => apps.reload())),
      ),
    reload: attempt('apps', 'reload', () => apps.reload()),
  }
})
