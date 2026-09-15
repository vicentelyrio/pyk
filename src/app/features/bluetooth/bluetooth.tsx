import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For, createComputed, createState, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { PanelEmpty, PanelHeader, PanelSectionHead, PanelStatus, Switch } from '@/ui/components'
import { bluetooth, type BluetoothDevice } from '@/infrastructure/bluetooth'
import { LL } from '@/infrastructure/i18n'

const cs = {
  root: 'bt',
  body: 'bt-body',
  section: 'bt-section',
  scan: 'bt-scan',
  scanDot: 'bt-scan-dot',
  list: 'bt-list',
  rows: 'bt-rows',
  row: 'bt-row',
  pick: 'bt-pick',
  icon: 'bt-icon',
  meta: 'bt-meta',
  name: 'bt-name',
  status: 'bt-status',
  address: 'bt-address',
  battery: 'bt-battery',
  remove: 'bt-remove',
  pair: 'bt-pair',
  failure: 'bt-failure',
  retry: 'bt-retry',

  on: '--on',
  armed: '--armed',
  active: '--active',
}

const icons = {
  headphones: 'pyk-headphones-symbolic',
  speaker: 'pyk-speaker-symbolic',
  keyboard: 'pyk-keyboard-symbolic',
  mouse: 'pyk-mouse-symbolic',
  phone: 'pyk-phone-symbolic',
  device: 'pyk-device-symbolic',
  remove: 'pyk-x-symbolic',
}

const DEVICE_ICONS: Readonly<Record<string, string>> = {
  'audio-headphones': icons.headphones,
  'audio-headset': icons.headphones,
  'audio-card': icons.speaker,
  'audio-speakers': icons.speaker,
  'multimedia-player': icons.speaker,
  'input-keyboard': icons.keyboard,
  'input-mouse': icons.mouse,
  'input-tablet': icons.mouse,
  'input-gaming': icons.mouse,
  'phone': icons.phone,
  'modem': icons.phone,
}

const LIST_MAX_HEIGHT = 214

function deviceIcon(icon: string): string {
  return DEVICE_ICONS[icon] ?? icons.device
}

function battery(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function Bluetooth({ onBack }: { readonly onBack: () => void }) {
  const t = LL().bluetooth

  const [armed, setArmed] = createState<string | null>(null)
  const [busy, setBusy] = createState<string | null>(null)
  const [failed, setFailed] = createState<string | null>(null)

  const reset = () => {
    setArmed(null)
    setBusy(null)
    setFailed(null)
  }

  const status = createComputed(() => {
    if (!bluetooth.hasAdapter()) return t.noAdapter()

    return bluetooth.isPowered() ? t.on() : t.off()
  })

  const live = createComputed(() => bluetooth.hasAdapter() && bluetooth.isPowered())

  const toggle = async (address: string) => {
    setArmed(null)
    setFailed(null)
    setBusy(address)

    const ok = await bluetooth.toggleDevice(address)

    setBusy(null)
    if (!ok) setFailed(address)
  }

  const join = (address: string) => {
    setFailed(null)
    setBusy(address)
    bluetooth.pair(address)
  }

  const drop = (address: string) => {
    if (armed() !== address) {
      setArmed(address)
      return
    }

    setArmed(null)
    bluetooth.remove(address)
  }

  return (
    <box
      class={cs.root}
      orientation={Gtk.Orientation.VERTICAL}
      $={(self) => {
        self.connect('map', reset)
      }}>
      <PanelHeader title={t.title()} backTooltip={t.back()} onBack={onBack}>
        <PanelStatus label={status} />
        <Switch
          on={bluetooth.isPowered}
          onToggle={bluetooth.togglePower}
          sensitive={bluetooth.hasAdapter}
          tooltip={t.radio()}
        />
      </PanelHeader>

      <PanelEmpty
        visible={bluetooth.hasAdapter.as((it) => !it)}
        title={t.noAdapterTitle()}
        hint={t.noAdapterHint()}
      />

      <PanelEmpty
        visible={createComputed(() => bluetooth.hasAdapter() && !bluetooth.isPowered())}
        title={t.offTitle()}
        hint={t.offHint()}
      />

      <box class={cs.body} orientation={Gtk.Orientation.VERTICAL} visible={live}>
        <box class={cs.section} orientation={Gtk.Orientation.VERTICAL}>
          <PanelSectionHead label={t.paired()} />
          <PairedList armed={armed} busy={busy} failed={failed} onToggle={toggle} onRemove={drop} />
        </box>

        <box class={cs.section} orientation={Gtk.Orientation.VERTICAL}>
          <PanelSectionHead label={t.available()}>
            <button
              class={bluetooth.isDiscovering.as((on) => clsx(cs.scan, on && cs.active))}
              focusable={false}
              onClicked={bluetooth.toggleScan}>
              <box valign={Gtk.Align.CENTER}>
                <box class={cs.scanDot} valign={Gtk.Align.CENTER} />
                <label label={bluetooth.isDiscovering.as((on) => (on ? t.stopScan() : t.scan()))} />
              </box>
            </button>
          </PanelSectionHead>
          <DiscoveredList busy={busy} onPair={join} />
        </box>
      </box>
    </box>
  )
}

type PairedProps = {
  readonly armed: Accessor<string | null>
  readonly busy: Accessor<string | null>
  readonly failed: Accessor<string | null>
  readonly onToggle: (address: string) => void
  readonly onRemove: (address: string) => void
}

function PairedList(props: PairedProps) {
  const t = LL().bluetooth

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <scrolledwindow
        class={cs.list}
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        propagateNaturalHeight
        maxContentHeight={LIST_MAX_HEIGHT}
        visible={bluetooth.devices.as((it) => it.length > 0)}>
        <box class={cs.rows} orientation={Gtk.Orientation.VERTICAL}>
          <For each={bluetooth.devices} id={(it: BluetoothDevice) => it.address}>
            {(it: BluetoothDevice) => <PairedRow device={it} {...props} />}
          </For>
        </box>
      </scrolledwindow>
      <PanelEmpty
        visible={bluetooth.devices.as((it) => it.length === 0)}
        title={t.noPairedTitle()}
        hint={t.noPairedHint()}
      />
    </box>
  )
}

function PairedRow({ device, armed, busy, failed, onToggle, onRemove }: PairedProps & { readonly device: BluetoothDevice }) {
  const t = LL().bluetooth

  const isArmed = armed.as((it) => it === device.address)
  const isBusy = busy.as((it) => it === device.address)
  const hasFailed = failed.as((it) => it === device.address)

  const label = createComputed(() => {
    if (isBusy()) return t.statusConnecting()

    return device.isConnected ? t.statusConnected() : t.statusDisconnected()
  })

  return (
    <box class={cs.row} orientation={Gtk.Orientation.VERTICAL}>
      <box>
        <button class={cs.pick} hexpand focusable={false} onClicked={() => onToggle(device.address)}>
          <box valign={Gtk.Align.CENTER}>
            <image
              class={clsx(cs.icon, device.isConnected && cs.on)}
              iconName={deviceIcon(device.icon)}
            />
            <box class={cs.meta} orientation={Gtk.Orientation.VERTICAL} hexpand>
              <label
                class={clsx(cs.name, device.isConnected && cs.on)}
                label={device.name}
                xalign={0}
                maxWidthChars={1}
                ellipsize={Pango.EllipsizeMode.END}
              />
              <label
                class={isBusy.as((it) => clsx(cs.status, (it || device.isConnected) && cs.on))}
                label={label}
                xalign={0}
              />
            </box>
            <label
              class={cs.battery}
              label={battery(device.battery)}
              visible={device.isConnected && device.battery > 0}
            />
          </box>
        </button>
        <button
          class={isArmed.as((it) => clsx(cs.remove, it && cs.armed))}
          tooltipText={isArmed.as((it) => (it ? t.confirmRemove() : t.remove()))}
          focusable={false}
          valign={Gtk.Align.CENTER}
          onClicked={() => onRemove(device.address)}>
          <image iconName={icons.remove} />
        </button>
      </box>

      <box class={cs.failure} visible={hasFailed} valign={Gtk.Align.CENTER}>
        <label label={t.connectFailed()} xalign={0} hexpand wrap />
        <button class={cs.retry} focusable={false} onClicked={() => onToggle(device.address)}>
          <label label={t.retry()} />
        </button>
      </box>
    </box>
  )
}

type DiscoveredProps = {
  readonly busy: Accessor<string | null>
  readonly onPair: (address: string) => void
}

function DiscoveredList({ busy, onPair }: DiscoveredProps) {
  const t = LL().bluetooth

  const empty = bluetooth.discovered.as((it) => it.length === 0)

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <scrolledwindow
        class={cs.list}
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        propagateNaturalHeight
        maxContentHeight={LIST_MAX_HEIGHT}
        visible={empty.as((it) => !it)}>
        <box class={cs.rows} orientation={Gtk.Orientation.VERTICAL}>
          <For each={bluetooth.discovered} id={(it: BluetoothDevice) => it.address}>
            {(it: BluetoothDevice) => (
              <DiscoveredRow device={it} busy={busy} onPair={onPair} />
            )}
          </For>
        </box>
      </scrolledwindow>
      <PanelEmpty
        visible={createComputed(() => empty() && bluetooth.isDiscovering())}
        title={t.scanningTitle()}
        hint={t.scanningHint()}
      />
      <PanelEmpty
        visible={createComputed(() => empty() && !bluetooth.isDiscovering())}
        title={t.idleTitle()}
        hint={t.idleHint()}
      />
    </box>
  )
}

function DiscoveredRow({ device, busy, onPair }: DiscoveredProps & { readonly device: BluetoothDevice }) {
  const t = LL().bluetooth

  const isBusy = busy.as((it) => it === device.address)
  const unnamed = device.name === device.address

  return (
    <box class={cs.row} orientation={Gtk.Orientation.VERTICAL}>
      <box class={cs.pick} valign={Gtk.Align.CENTER}>
        <image class={cs.icon} iconName={deviceIcon(device.icon)} />
        <box class={cs.meta} orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label
            class={clsx(cs.name, unnamed && cs.address)}
            label={device.name}
            xalign={0}
            maxWidthChars={1}
            ellipsize={Pango.EllipsizeMode.END}
          />
          <label class={cs.address} label={device.address} xalign={0} visible={!unnamed} />
        </box>
        <label class={cs.status} label={t.pairing()} visible={isBusy} />
        <button
          class={cs.pair}
          focusable={false}
          visible={isBusy.as((it) => !it)}
          onClicked={() => onPair(device.address)}>
          <label label={t.pair()} />
        </button>
      </box>
    </box>
  )
}
