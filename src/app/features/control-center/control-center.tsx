import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { createComputed, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { Popover } from '@/ui/components'
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
  status: 'control-status',
  statusIcon: 'control-status-icon',
  panel: 'control-panel',
  user: 'control-user',
  avatar: 'control-avatar',
  identity: 'control-identity',
  name: 'control-name',
  uptime: 'control-uptime',
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

  on: '--on',
  off: '--off',
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
}

const COLUMNS = 4

function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

function closeFrom(widget: Gtk.Widget, then?: () => void) {
  const popover = widget.get_ancestor(Gtk.Popover.$gtype) as Gtk.Popover | null
  popover?.popdown()
  if (then) GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
    then()
    return GLib.SOURCE_REMOVE
  })
}

export function ControlCenter({ className }: { className?: string }) {
  return (
    <Popover
      className={clsx(cs.root, className)}
      contentClassName={cs.panel}
      tooltip="Control center"
      trigger={<ControlStatus />}>
      <box
        orientation={Gtk.Orientation.VERTICAL}
        $={(self) => {
          self.connect('map', () => brightness.refresh())
        }}>
        <ControlUser />
        <ControlTiles />
        <ControlSliders />
        <ControlDevices />
      </box>
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

function ControlUser() {
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
    </box>
  )
}

type Tile = {
  readonly name: string
  readonly icon: string
  readonly on?: Accessor<boolean>
  readonly visible?: Accessor<boolean>
  readonly act: (self: Gtk.Widget) => void
}

function ControlTiles() {
  const tiles: readonly Tile[] = [
    { name: 'Wi-Fi', icon: icons.wifi, on: network.wifiEnabled, act: () => network.toggleWifi() },
    { name: 'Bluetooth', icon: icons.bluetooth, on: bluetooth.isPowered, visible: bluetooth.hasAdapter, act: () => bluetooth.togglePower() },
    { name: 'Do not disturb', icon: icons.bell, on: notifications.dontDisturb, act: () => notifications.toggleDontDisturb() },
    { name: 'Keep awake', icon: icons.keepAwake, on: idle.inhibited, act: () => idle.toggle() },
    { name: 'Screenshot', icon: icons.screenshot, act: (self) => closeFrom(self, niri.screenshot) },
    { name: 'Overview', icon: icons.overview, act: (self) => closeFrom(self, niri.toggleOverview) },
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

  return (
    <button
      class={on ? on.as((it) => clsx(cs.tile, it ? cs.on : cs.off)) : clsx(cs.tile, cs.off)}
      tooltipText={tile.name}
      focusable={false}
      visible={tile.visible ?? true}
      onClicked={(self: Gtk.Button) => tile.act(self)}>
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
}

function DeviceRow({ label, value, visible }: DeviceRowProps) {
  return (
    <box class={cs.device} visible={visible ?? true}>
      <label class={cs.deviceLabel} label={label} xalign={0} hexpand ellipsize={Pango.EllipsizeMode.END} />
      <label class={cs.deviceValue} label={value} />
    </box>
  )
}

function ControlDevices() {
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
      <DeviceRow label={networkLabel} value={networkValue} />
      <DeviceRow label={bluetoothLabel} value={bluetoothValue} visible={bluetooth.hasAdapter} />
      <DeviceRow label={createComputed(() => 'Battery')} value={battery.label} visible={battery.isPresent} />
    </box>
  )
}
