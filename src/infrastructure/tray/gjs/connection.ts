import AstalTray from 'gi://AstalTray'
import { Stream } from 'effect'

import { fromSignal, reconnecting, type SourceError } from '@/infrastructure/effect'

import type { TrayEntry, TrayState } from '../store/state'

function entry(item: AstalTray.TrayItem): TrayEntry {
  return {
    id: item.itemId,
    title: item.title ?? '',
    tooltip: item.tooltipMarkup ?? '',
    gicon: item.gicon,
    isMenu: item.isMenu,
    menuModel: item.menuModel ?? null,
    actionGroup: item.actionGroup ?? null,
  }
}

function snapshot(tray: AstalTray.Tray): TrayState {
  return {
    items: tray.get_items().filter((item) => item.itemId && item.gicon).map(entry),
  }
}

export function stateChanges(tray: AstalTray.Tray): Stream.Stream<TrayState, SourceError> {
  const snap = () => snapshot(tray)

  return fromSignal('tray', tray, 'notify::items', () => tray.get_items()).pipe(
    Stream.switchMap((items) =>
      Stream.mergeAll(
        [Stream.sync(snap), ...items.map((item) => fromSignal('tray', item, 'notify', snap))],
        { concurrency: 'unbounded' },
      ),
    ),
    reconnecting,
  )
}
