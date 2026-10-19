import AstalTray from 'gi://AstalTray'
import { Layer } from 'effect'

import { attempt } from '@/infrastructure/effect'

import { TrayBackend } from '../store/backend'
import { stateChanges } from './connection'

export const TrayBackendLive = Layer.sync(TrayBackend, () => {
  const tray = AstalTray.get_default()

  const onItem = (action: string, id: string, run: (item: AstalTray.TrayItem) => void) =>
    attempt('tray', action, () => {
      const item = tray.get_item(id)
      if (item) run(item)
    })

  return {
    changes: stateChanges(tray),
    activate: (id: string, x: number, y: number) => onItem('activate', id, (it) => it.activate(x, y)),
    secondaryActivate: (id: string, x: number, y: number) =>
      onItem('secondaryActivate', id, (it) => it.secondary_activate(x, y)),
    aboutToShow: (id: string) => onItem('aboutToShow', id, (it) => it.about_to_show()),
  }
})
