import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { createState, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { closePopover, Popover } from '@/ui/components'
import { host } from '@/infrastructure/host'
import { niri } from '@/infrastructure/niri'
import { session } from '@/infrastructure/session'

const cs = {
  root: 'session',
  trigger: 'session-trigger',
  panel: 'session-panel',
  header: 'session-header',
  avatar: 'session-avatar',
  identity: 'session-identity',
  name: 'session-name',
  uptime: 'session-uptime',
  actions: 'session-actions',
  action: 'session-action',
  label: 'session-label',
  hint: 'session-hint',

  danger: '--danger',
  armed: '--armed',
}

const icons = {
  power: 'pyk-power-symbolic',
  lock: 'pyk-lock-symbolic',
  suspend: 'pyk-suspend-symbolic',
  logout: 'pyk-logout-symbolic',
  restart: 'pyk-restart-symbolic',
}

type SessionAction = {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly danger: boolean
  readonly run: () => void
}

const ACTIONS: readonly SessionAction[] = [
  { id: 'lock', label: 'Lock', icon: icons.lock, danger: false, run: session.lock },
  { id: 'suspend', label: 'Suspend', icon: icons.suspend, danger: false, run: session.suspend },
  { id: 'logout', label: 'Log out', icon: icons.logout, danger: true, run: niri.quit },
  { id: 'reboot', label: 'Reboot', icon: icons.restart, danger: true, run: session.reboot },
  { id: 'poweroff', label: 'Shut down', icon: icons.power, danger: true, run: session.powerOff },
]

export function Session({ className }: { className?: string }) {
  const [armed, setArmed] = createState<string | null>(null)

  return (
    <Popover
      className={clsx(cs.root, className)}
      contentClassName={cs.panel}
      tooltip="Session"
      trigger={<image class={cs.trigger} iconName={icons.power} />}>
      <box
        orientation={Gtk.Orientation.VERTICAL}
        $={(self) => {
          self.connect('map', () => setArmed(null))
        }}>
        <SessionHeader />
        <box class={cs.actions} orientation={Gtk.Orientation.VERTICAL}>
          {ACTIONS.map((action) => (
            <SessionRow action={action} armed={armed} onArm={setArmed} />
          ))}
        </box>
      </box>
    </Popover>
  )
}

function SessionHeader() {
  return (
    <box class={cs.header}>
      <box class={cs.avatar} valign={Gtk.Align.CENTER} halign={Gtk.Align.START} hexpand={false}>
        <label
          label={host.displayName.charAt(0).toUpperCase()}
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          hexpand
          vexpand
        />
      </box>
      <box class={cs.identity} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} hexpand>
        <label class={cs.name} label={host.displayName} xalign={0} ellipsize={Pango.EllipsizeMode.END} />
        <label class={cs.uptime} label={host.uptime} xalign={0} />
      </box>
    </box>
  )
}

type SessionRowProps = {
  readonly action: SessionAction
  readonly armed: Accessor<string | null>
  readonly onArm: (id: string | null) => void
}

function SessionRow({ action, armed, onArm }: SessionRowProps) {
  const isArmed = armed.as((it) => it === action.id)

  return (
    <button
      class={isArmed.as((it) => clsx(cs.action, action.danger && cs.danger, it && cs.armed))}
      focusable={false}
      onClicked={(self: Gtk.Button) => {
        if (action.danger && !isArmed()) {
          onArm(action.id)
          return
        }
        onArm(null)
        closePopover(self, action.run)
      }}>
      <box>
        <image iconName={action.icon} />
        <label
          class={cs.label}
          label={isArmed.as((it) => (it ? `Confirm ${action.label.toLowerCase()}` : action.label))}
          xalign={0}
          hexpand
        />
        <label class={cs.hint} label="click" visible={isArmed} />
      </box>
    </button>
  )
}
