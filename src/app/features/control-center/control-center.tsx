import Pango from 'gi://Pango'
import { Gdk, Gtk } from 'ags/gtk4'
import { createComputed, createState, onCleanup, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { closePopover, Popover } from '@/ui/components'
import { Bluetooth } from '@/app/features/bluetooth'
import { Wifi } from '@/app/features/wifi'
import { audio } from '@/infrastructure/audio'
import { battery } from '@/infrastructure/battery'
import { bluetooth } from '@/infrastructure/bluetooth'
import { brightness } from '@/infrastructure/brightness'
import { host } from '@/infrastructure/host'
import { idle } from '@/infrastructure/idle'
import { network } from '@/infrastructure/network'
import { niri } from '@/infrastructure/niri'
import { notifications } from '@/infrastructure/notifications'

const cs = {
  root: 'control',
  pages: 'control-pages',
  status: 'control-status',
  statusIcon: 'control-status-icon',
  panel: 'control-panel',
  user: 'control-user',
  avatar: 'control-avatar',
  identity: 'control-identity',
  name: 'control-name',
  uptime: 'control-uptime',
  gear: 'control-gear',
  tiles: 'control-tiles',
  tile: 'control-tile',
  sliders: 'control-sliders',
  slider: 'control-slider',
  sliderIcon: 'control-slider-icon',
  sliderValue: 'control-slider-value',
  devices: 'control-devices',
  device: 'control-device',
  deviceLabel: 'control-device-label',
  deviceValue: 'control-device-value',
  deviceChevron: 'control-device-chevron',

  on: '--on',
  off: '--off',
  drill: '--drill',
}

const icons = {
  wifi: 'pyk-wifi-symbolic',
  wifiOff: 'pyk-wifi-off-symbolic',
  bluetooth: 'pyk-bluetooth-symbolic',
  battery: 'pyk-battery-symbolic',
  bell: 'pyk-bell-symbolic',
  keepAwake: 'pyk-keep-awake-symbolic',
  screenshot: 'pyk-screenshot-symbolic',
  overview: 'pyk-overview-symbolic',
  brightness: 'pyk-brightness-symbolic',
  volume: 'pyk-volume-symbolic',
  volumeMuted: 'pyk-volume-muted-symbolic',
  drill: 'pyk-chevron-right-symbolic',
  gear: 'pyk-gear-symbolic',
}

const COLUMNS = 4
const PAGE_FADE = 150

type Page = 'root' | 'wifi' | 'bluetooth'

function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export type ControlCenterProps = {
  readonly className?: string
  readonly onSettings: () => void
}

export function ControlCenter({ className, onSettings }: ControlCenterProps) {
  const [page, setPage] = createState<Page>('root')

  const toRoot = () => setPage('root')
  const toWifi = () => setPage('wifi')
  const toBluetooth = () => setPage('bluetooth')

  const rootPage = (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <ControlUser onSettings={onSettings} />
      <ControlTiles onWifi={toWifi} onBluetooth={toBluetooth} />
      <ControlSliders />
      <ControlDevices onWifi={toWifi} onBluetooth={toBluetooth} />
    </box>
  ) as Gtk.Widget

  const wifiPage = (<Wifi onBack={toRoot} />) as Gtk.Widget
  const bluetoothPage = (<Bluetooth onBack={toRoot} />) as Gtk.Widget

  const pages: Readonly<Record<Page, Gtk.Widget>> = {
    root: rootPage,
    wifi: wifiPage,
    bluetooth: bluetoothPage,
  }

  return (
    <Popover
      className={clsx(cs.root, className)}
      contentClassName={cs.panel}
      tooltip="Control center"
      trigger={<ControlStatus />}>
      <stack
        class={cs.pages}
        transitionType={Gtk.StackTransitionType.CROSSFADE}
        transitionDuration={PAGE_FADE}
        vhomogeneous={false}
        $={(self) => {
          const stack = self as Gtk.Stack

          stack.connect('map', () => {
            setPage('root')
            brightness.refresh()
          })

          onCleanup(page.subscribe(() => {
            stack.set_visible_child(pages[page()])
          }))
        }}>
        {rootPage}
        {wifiPage}
        {bluetoothPage}
      </stack>
    </Popover>
  )
}

function ControlStatus() {
  return (
    <box class={cs.status} valign={Gtk.Align.CENTER}>
      <image
        class={cs.statusIcon}
        iconName={network.wifiEnabled.as((on) => (on ? icons.wifi : icons.wifiOff))}
      />
      <image class={cs.statusIcon} iconName={icons.bluetooth} visible={bluetooth.isPowered} />
      <image class={cs.statusIcon} iconName={icons.battery} visible={battery.isPresent} />
    </box>
  )
}

function ControlUser({ onSettings }: { readonly onSettings: () => void }) {
  return (
    <box class={cs.user}>
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
        <label class={cs.uptime} label={host.uptime.as((it) => `${it} · ${host.distro}`)} xalign={0} />
      </box>
      <button
        class={cs.gear}
        tooltipText="Settings"
        focusable={false}
        valign={Gtk.Align.CENTER}
        onClicked={(self: Gtk.Button) => closePopover(self, onSettings)}>
        <image iconName={icons.gear} />
      </button>
    </box>
  )
}

type Tile = {
  readonly name: string
  readonly icon: string
  readonly on?: Accessor<boolean>
  readonly visible?: Accessor<boolean>
  readonly act: (self: Gtk.Widget) => void
  readonly drill?: () => void
}

type DrillProps = {
  readonly onWifi: () => void
  readonly onBluetooth: () => void
}

function ControlTiles({ onWifi, onBluetooth }: DrillProps) {
  const tiles: readonly Tile[] = [
    { name: 'Wi-Fi', icon: icons.wifi, on: network.wifiEnabled, act: () => network.toggleWifi(), drill: onWifi },
    { name: 'Bluetooth', icon: icons.bluetooth, on: bluetooth.isPowered, visible: bluetooth.hasAdapter, act: () => bluetooth.togglePower(), drill: onBluetooth },
    { name: 'Do not disturb', icon: icons.bell, on: notifications.dontDisturb, act: () => notifications.toggleDontDisturb() },
    { name: 'Keep awake', icon: icons.keepAwake, on: idle.inhibited, act: () => idle.toggle() },
    { name: 'Screenshot', icon: icons.screenshot, act: (self) => closePopover(self, niri.screenshot) },
    { name: 'Overview', icon: icons.overview, act: (self) => closePopover(self, niri.toggleOverview) },
  ]

  const rows: Tile[][] = []
  for (let at = 0; at < tiles.length; at += COLUMNS) rows.push(tiles.slice(at, at + COLUMNS))

  return (
    <box class={cs.tiles} orientation={Gtk.Orientation.VERTICAL}>
      {rows.map((row) => (
        <box homogeneous>
          {[...row, ...Array.from({ length: COLUMNS - row.length }, () => null)].map((tile) =>
            tile ? <ControlTile tile={tile} /> : <box />)}
        </box>
      ))}
    </box>
  )
}

function ControlTile({ tile }: { readonly tile: Tile }) {
  const on = tile.on ?? null

  const secondary = (self: Gtk.Widget) => {
    const { drill } = tile
    if (!drill) return

    const click = new Gtk.GestureClick({ button: Gdk.BUTTON_SECONDARY })
    click.connect('pressed', () => drill())
    self.add_controller(click)
  }

  return (
    <button
      class={on ? on.as((it) => clsx(cs.tile, it ? cs.on : cs.off)) : clsx(cs.tile, cs.off)}
      tooltipText={tile.name}
      focusable={false}
      visible={tile.visible ?? true}
      onClicked={(self: Gtk.Button) => tile.act(self)}
      $={secondary}>
      <image iconName={tile.icon} />
    </button>
  )
}

type SliderRowProps = {
  readonly icon: Accessor<string> | string
  readonly value: Accessor<number>
  readonly onChange: (value: number) => void
  readonly onIcon?: () => void
  readonly visible?: Accessor<boolean>
}

function SliderRow({ icon, value, onChange, onIcon, visible }: SliderRowProps) {
  return (
    <box class={cs.slider} visible={visible ?? true}>
      <button class={cs.sliderIcon} focusable={false} onClicked={() => onIcon?.()} sensitive={Boolean(onIcon)}>
        <image iconName={icon} />
      </button>
      <slider
        hexpand
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChangeValue={(self: Gtk.Range) => onChange(self.get_value())}
      />
      <label class={cs.sliderValue} label={value.as(percent)} xalign={1} />
    </box>
  )
}

function ControlSliders() {
  return (
    <box class={cs.sliders} orientation={Gtk.Orientation.VERTICAL}>
      <SliderRow
        icon={icons.brightness}
        value={brightness.level}
        onChange={brightness.setLevel}
        visible={brightness.isAvailable}
      />
      <SliderRow
        icon={audio.isMuted.as((muted) => (muted ? icons.volumeMuted : icons.volume))}
        value={createComputed(() => (audio.isMuted() ? 0 : audio.volume()))}
        onChange={audio.setVolume}
        onIcon={audio.toggleMute}
        visible={audio.hasSpeaker}
      />
    </box>
  )
}

type DeviceRowProps = {
  readonly label: Accessor<string>
  readonly value: Accessor<string>
  readonly visible?: Accessor<boolean>
  readonly onDrill?: () => void
  readonly drillable?: Accessor<boolean>
}

function DeviceLine({ label, value, drillable }: DeviceRowProps) {
  return (
    <box>
      <label class={cs.deviceLabel} label={label} xalign={0} hexpand ellipsize={Pango.EllipsizeMode.END} />
      <label class={cs.deviceValue} label={value} />
      <image class={cs.deviceChevron} iconName={icons.drill} visible={drillable ?? false} />
    </box>
  )
}

function DeviceRow(props: DeviceRowProps) {
  const { visible, onDrill, drillable } = props

  if (!onDrill) {
    return (
      <box class={cs.device} visible={visible ?? true}>
        <DeviceLine {...props} />
      </box>
    )
  }

  return (
    <button
      class={clsx(cs.device, cs.drill)}
      visible={visible ?? true}
      sensitive={drillable ?? true}
      focusable={false}
      onClicked={onDrill}>
      <DeviceLine {...props} />
    </button>
  )
}

function ControlDevices({ onWifi, onBluetooth }: DrillProps) {
  const networkLabel = createComputed(() => {
    if (network.kind() === 'wifi') return network.ssid() || 'Wi-Fi'
    if (network.kind() === 'wired') return 'Wired'
    return 'No network'
  })

  const networkValue = createComputed(() => {
    if (network.isConnecting()) return 'connecting'
    if (network.kind() === 'wifi' && network.isConnected()) return percent(network.strength() / 100)
    if (network.isConnected()) return 'connected'
    return network.wifiEnabled() ? 'disconnected' : 'off'
  })

  const connected = createComputed(() => bluetooth.devices().find((it) => it.isConnected) ?? null)

  const bluetoothLabel = createComputed(() => {
    if (!bluetooth.isPowered()) return 'Bluetooth off'
    return connected()?.name ?? 'Bluetooth'
  })

  const bluetoothValue = createComputed(() => {
    if (!bluetooth.isPowered()) return 'off'
    const device = connected()
    if (!device) return 'on'
    return device.battery > 0 ? percent(device.battery) : 'connected'
  })

  return (
    <box class={cs.devices} orientation={Gtk.Orientation.VERTICAL}>
      <DeviceRow
        label={networkLabel}
        value={networkValue}
        onDrill={onWifi}
        drillable={network.hasWifi}
      />
      <DeviceRow
        label={bluetoothLabel}
        value={bluetoothValue}
        visible={bluetooth.hasAdapter}
        onDrill={onBluetooth}
        drillable={bluetooth.hasAdapter}
      />
      <DeviceRow label={createComputed(() => 'Battery')} value={battery.label} visible={battery.isPresent} />
    </box>
  )
}
