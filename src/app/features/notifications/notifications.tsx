import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For, createComputed } from 'ags'
import { clsx } from 'clsx'
import { Avatar, Popover } from '@/ui/components'
import { notifications, type Notification } from '@/infrastructure/notifications'

const cs = {
  root: 'notifs',
  bell: 'notifs-bell',
  badge: 'notifs-badge',
  panel: 'notifs-panel',
  header: 'notifs-header',
  title: 'notifs-title',
  actions: 'notifs-actions',
  chip: 'notifs-chip',
  dnd: 'notifs-dnd',
  list: 'notifs-list',
  rows: 'notifs-rows',
  row: 'notifs-row',
  meta: 'notifs-meta',
  headline: 'notifs-headline',
  name: 'notifs-name',
  time: 'notifs-time',
  body: 'notifs-body',
  dismiss: 'notifs-dismiss',
  empty: 'notifs-empty',

  active: '--active',
}

const icons = {
  bell: 'pyk-bell-symbolic',
  dismiss: 'pyk-x-symbolic',
}

const LIST_MAX_HEIGHT = 400

export function Notifications({ className }: { className?: string }) {
  return (
    <Popover
      className={clsx(cs.root, className)}
      contentClassName={cs.panel}
      tooltip="Notifications"
      trigger={<NotificationsBell />}>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <NotificationsHeader />
        <NotificationsList />
      </box>
    </Popover>
  )
}

function NotificationsBell() {
  const unread = createComputed(() => notifications.hasNotifications() && !notifications.dontDisturb())

  return (
    <overlay class={cs.bell}>
      <image iconName={icons.bell} />
      <box
        $type="overlay"
        class={cs.badge}
        visible={unread}
        halign={Gtk.Align.END}
        valign={Gtk.Align.START}
      />
    </overlay>
  )
}

function NotificationsHeader() {
  return (
    <box class={cs.header} valign={Gtk.Align.CENTER}>
      <label class={cs.title} label="Notifications" xalign={0} hexpand />
      <box class={cs.actions} halign={Gtk.Align.END}>
        <button
          class={createComputed(() => clsx(cs.chip, cs.dnd, notifications.dontDisturb() && cs.active))}
          onClicked={notifications.toggleDontDisturb}>
          <label label="Do not disturb" />
        </button>
        <button class={cs.chip} onClicked={notifications.dismissAll}>
          <label label="Clear" />
        </button>
      </box>
    </box>
  )
}

function NotificationsList() {
  return (
    <scrolledwindow
      class={cs.list}
      hscrollbarPolicy={Gtk.PolicyType.NEVER}
      propagateNaturalHeight
      maxContentHeight={LIST_MAX_HEIGHT}>
      <box class={cs.rows} orientation={Gtk.Orientation.VERTICAL}>
        <For each={notifications.notifications} id={(it: Notification) => it.id}>
          {(it: Notification) => <NotificationRow {...it} />}
        </For>
        <NotificationsEmpty />
      </box>
    </scrolledwindow>
  )
}

function NotificationsEmpty() {
  return (
    <label
      class={cs.empty}
      label="Nothing new"
      visible={notifications.hasNotifications.as((has: boolean) => !has)}
    />
  )
}

function NotificationRow({ id, appName, summary, body, time }: Notification) {
  return (
    <box class={cs.row}>
      <Avatar name={appName} />
      <box class={cs.meta} orientation={Gtk.Orientation.VERTICAL} hexpand>
        <box class={cs.headline}>
          <label
            class={cs.name}
            label={summary || appName}
            xalign={0}
            maxWidthChars={1}
            ellipsize={Pango.EllipsizeMode.END}
            hexpand
          />
          <label class={cs.time} label={clock(time)} />
        </box>
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
      <button
        class={cs.dismiss}
        tooltipText="Dismiss"
        valign={Gtk.Align.START}
        onClicked={() => notifications.dismiss(id)}>
        <image iconName={icons.dismiss} />
      </button>
    </box>
  )
}

function clock(time: number): string {
  return GLib.DateTime.new_from_unix_local(time).format('%H:%M') ?? ''
}
