import app from 'ags/gtk4/app'
import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import { Astal, Gtk } from 'ags/gtk4'
import { For, createExternal, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { notifications, type Notification } from '@/infrastructure/notifications'

import { NotificationAvatar } from '@/app/features/notifications/avatar'
import { TOASTS_WINDOW } from './window'

const cs = {
  root: 'toasts',
  stack: 'toasts-stack',
  toast: 'toast',
  meta: 'toast-meta',
  title: 'toast-title',
  body: 'toast-body',

  critical: '--critical',
}

const TIMEOUT = 3200
const FRESH = 10

export function NotificationToasts() {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const toasts = createToasts()

  return (
    <window
      name={TOASTS_WINDOW}
      class={cs.root}
      visible={toasts.as((it) => it.length > 0)}
      resizable={false}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      application={app}>
      <box
        class={cs.stack}
        orientation={Gtk.Orientation.VERTICAL}
        halign={Gtk.Align.END}>
        <For each={toasts} id={(it: Notification) => it.id}>
          {(it: Notification) => <Toast {...it} />}
        </For>
      </box>
    </window>
  )
}

function Toast({ id, appName, summary, body, urgency }: Notification) {
  return (
    <button
      class={clsx(cs.toast, urgency === 'critical' && cs.critical)}
      tooltipText="Dismiss"
      onClicked={() => notifications.dismiss(id)}>
      <box>
        <NotificationAvatar appName={appName} />
        <box class={cs.meta} orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label
            class={cs.title}
            label={summary || appName}
            xalign={0}
            maxWidthChars={1}
            ellipsize={Pango.EllipsizeMode.END}
            hexpand
          />
          <label
            class={cs.body}
            label={body}
            visible={Boolean(body)}
            xalign={0}
            wrap
            wrapMode={Pango.WrapMode.WORD_CHAR}
            maxWidthChars={1}
            hexpand
          />
        </box>
      </box>
    </button>
  )
}

function createToasts(): Accessor<readonly Notification[]> {
  return createExternal<readonly Notification[]>([], (set) => {
    const seen = new Set<number>()
    const timers = new Map<number, number>()
    let shown: readonly Notification[] = []

    const stop = (id: number) => {
      const timer = timers.get(id)
      if (timer) GLib.source_remove(timer)
      timers.delete(id)
    }

    const expire = (id: number) => {
      timers.delete(id)
      shown = shown.filter((it) => it.id !== id)
      set(shown)
    }

    const sync = () => {
      const inbox = notifications.notifications()
      const live = new Set(inbox.map((it) => it.id))
      const now = GLib.DateTime.new_now_local().to_unix()

      for (const it of shown) if (!live.has(it.id)) stop(it.id)
      shown = shown.filter((it) => live.has(it.id))

      for (const it of inbox) {
        if (seen.has(it.id)) continue
        seen.add(it.id)

        if (notifications.dontDisturb() || now - it.time > FRESH) continue

        shown = [it, ...shown]
        if (it.urgency === 'critical') continue

        timers.set(it.id, GLib.timeout_add(GLib.PRIORITY_DEFAULT, TIMEOUT, () => {
          expire(it.id)
          return GLib.SOURCE_REMOVE
        }))
      }

      set(shown)
    }

    const dispose = notifications.notifications.subscribe(sync)
    sync()

    return () => {
      dispose()
      for (const timer of timers.values()) GLib.source_remove(timer)
    }
  })
}
