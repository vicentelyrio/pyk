import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For, createComputed, createState, type Accessor } from 'ags'
import { clsx } from 'clsx'
import { Switch } from '@/ui/components'
import { LL } from '@/infrastructure/i18n'
import { network, type AccessPoint } from '@/infrastructure/network'

const cs = {
  root: 'wifi',
  header: 'wifi-header',
  back: 'wifi-back',
  title: 'wifi-title',
  radio: 'wifi-radio',
  body: 'wifi-body',
  card: 'wifi-card',
  cardHead: 'wifi-card-head',
  cardIcon: 'wifi-card-icon',
  cardMeta: 'wifi-card-meta',
  ssid: 'wifi-ssid',
  detail: 'wifi-detail',
  badge: 'wifi-badge',
  actions: 'wifi-actions',
  action: 'wifi-action',
  sectionHead: 'wifi-section-head',
  section: 'wifi-section',
  scan: 'wifi-scan',
  list: 'wifi-list',
  rows: 'wifi-rows',
  row: 'wifi-row',
  pick: 'wifi-pick',
  icon: 'wifi-icon',
  name: 'wifi-name',
  saved: 'wifi-saved',
  lock: 'wifi-lock',
  strength: 'wifi-strength',
  form: 'wifi-form',
  field: 'wifi-field',
  input: 'wifi-input',
  reveal: 'wifi-reveal',
  submit: 'wifi-submit',
  error: 'wifi-error',
  busy: 'wifi-busy',
  empty: 'wifi-empty',
  emptyTitle: 'wifi-empty-title',
  emptyHint: 'wifi-empty-hint',

  open: '--open',
  failed: '--failed',
  active: '--active',
}

const icons = {
  back: 'pyk-chevron-left-symbolic',
  lock: 'pyk-lock-symbolic',
  eye: 'pyk-eye-symbolic',
  eyeOff: 'pyk-eye-off-symbolic',
  signal: ['pyk-wifi-1-symbolic', 'pyk-wifi-2-symbolic', 'pyk-wifi-3-symbolic', 'pyk-wifi-4-symbolic'],
}

const LIST_MAX_HEIGHT = 214

function signal(strength: number): string {
  if (strength >= 75) return icons.signal[3]
  if (strength >= 50) return icons.signal[2]
  if (strength >= 25) return icons.signal[1]

  return icons.signal[0]
}

function percent(strength: number): string {
  return `${Math.round(strength)}%`
}

function band(frequency: number): string {
  if (!frequency) return ''

  return frequency >= 5000 ? '5 GHz' : '2.4 GHz'
}

export function Wifi({ onBack }: { readonly onBack: () => void }) {
  const t = LL().wifi

  const [expanded, setExpanded] = createState<string | null>(null)
  const [password, setPassword] = createState('')
  const [reveal, setReveal] = createState(false)
  const [busy, setBusy] = createState<string | null>(null)
  const [failed, setFailed] = createState<string | null>(null)

  const reset = () => {
    setExpanded(null)
    setPassword('')
    setReveal(false)
    setBusy(null)
    setFailed(null)
  }

  const submit = async (point: AccessPoint, key: string | null) => {
    setFailed(null)
    setBusy(point.bssid)

    const ok = await network.connect(point.bssid, key)

    setBusy(null)

    if (!ok) {
      setFailed(point.bssid)
      return
    }

    setExpanded(null)
    setPassword('')
    setReveal(false)
  }

  const pick = (point: AccessPoint) => {
    if (!point.secure || point.saved) {
      void submit(point, null)
      return
    }

    setPassword('')
    setReveal(false)
    setFailed(null)
    setExpanded((it) => (it === point.bssid ? null : point.bssid))
  }

  return (
    <box
      class={cs.root}
      orientation={Gtk.Orientation.VERTICAL}
      $={(self) => {
        self.connect('map', reset)
      }}>
      <box class={cs.header} valign={Gtk.Align.CENTER}>
        <button class={cs.back} tooltipText={t.back()} focusable={false} onClicked={onBack}>
          <image iconName={icons.back} />
        </button>
        <label class={cs.title} label={t.title()} xalign={0} hexpand />
        <label class={cs.radio} label={network.wifiEnabled.as((on) => (on ? t.on() : t.off()))} />
        <Switch on={network.wifiEnabled} onToggle={network.toggleWifi} tooltip={t.radio()} />
      </box>

      <box class={cs.body} orientation={Gtk.Orientation.VERTICAL} visible={network.wifiEnabled}>
        <WifiCurrent />
        <box class={cs.section} orientation={Gtk.Orientation.VERTICAL}>
          <box class={cs.sectionHead} valign={Gtk.Align.CENTER}>
            <label class={cs.title} label={t.available()} xalign={0} hexpand />
            <button
              class={network.isScanning.as((on) => clsx(cs.scan, on && cs.active))}
              focusable={false}
              sensitive={network.isScanning.as((on) => !on)}
              onClicked={network.scan}>
              <label label={network.isScanning.as((on) => (on ? t.scanning() : t.scan()))} />
            </button>
          </box>
          <WifiList
            expanded={expanded}
            password={password}
            reveal={reveal}
            busy={busy}
            failed={failed}
            onPick={pick}
            onPassword={setPassword}
            onReveal={() => setReveal((it) => !it)}
            onSubmit={submit}
          />
        </box>
      </box>

      <WifiEmpty
        visible={network.wifiEnabled.as((on) => !on)}
        title={t.offTitle()}
        hint={t.offHint()}
      />
    </box>
  )
}

function WifiCurrent() {
  const t = LL().wifi

  const present = createComputed(() => network.kind() === 'wifi' && network.ssid() !== '')

  const meta = createComputed(() =>
    [network.security(), band(network.frequency()), percent(network.strength())]
      .filter(Boolean)
      .join(' · '))

  const route = createComputed(() => {
    const address = network.address()
    if (!address) return ''
    const gateway = network.gateway()

    return gateway ? `${address} · gw ${gateway}` : address
  })

  return (
    <box class={cs.card} orientation={Gtk.Orientation.VERTICAL} visible={present}>
      <box class={cs.cardHead}>
        <image class={cs.cardIcon} iconName={network.strength.as(signal)} valign={Gtk.Align.START} />
        <box class={cs.cardMeta} orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label class={cs.ssid} label={network.ssid} xalign={0} ellipsize={Pango.EllipsizeMode.END} />
          <label class={cs.detail} label={meta} xalign={0} />
          <label class={cs.detail} label={route} xalign={0} visible={route.as(Boolean)} />
        </box>
        <label class={cs.badge} label={t.connected()} valign={Gtk.Align.START} visible={network.isConnected} />
      </box>
      <box class={cs.actions}>
        <button class={cs.action} focusable={false} onClicked={network.disconnect}>
          <label label={t.disconnect()} />
        </button>
      </box>
    </box>
  )
}

type ListProps = {
  readonly expanded: Accessor<string | null>
  readonly password: Accessor<string>
  readonly reveal: Accessor<boolean>
  readonly busy: Accessor<string | null>
  readonly failed: Accessor<string | null>
  readonly onPick: (point: AccessPoint) => void
  readonly onPassword: (value: string) => void
  readonly onReveal: () => void
  readonly onSubmit: (point: AccessPoint, key: string | null) => void
}

function WifiList(props: ListProps) {
  const t = LL().wifi

  const points = createComputed(() => network.accessPoints().filter((it) => !it.isActive))

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <scrolledwindow
        class={cs.list}
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        propagateNaturalHeight
        maxContentHeight={LIST_MAX_HEIGHT}
        visible={points.as((it) => it.length > 0)}>
        <box class={cs.rows} orientation={Gtk.Orientation.VERTICAL}>
          <For each={points} id={(it: AccessPoint) => it.bssid}>
            {(it: AccessPoint) => <WifiRow point={it} {...props} />}
          </For>
        </box>
      </scrolledwindow>
      <WifiEmpty
        visible={points.as((it) => it.length === 0)}
        title={t.emptyTitle()}
        hint={t.emptyHint()}
      />
    </box>
  )
}

function WifiRow({ point, ...props }: ListProps & { readonly point: AccessPoint }) {
  const t = LL().wifi

  const open = props.expanded.as((it) => it === point.bssid)
  const connecting = props.busy.as((it) => it === point.bssid)
  const wrong = props.failed.as((it) => it === point.bssid)

  return (
    <box class={open.as((it) => clsx(cs.row, it && cs.open))} orientation={Gtk.Orientation.VERTICAL}>
      <button class={cs.pick} focusable={false} onClicked={() => props.onPick(point)}>
        <box valign={Gtk.Align.CENTER}>
          <image class={cs.icon} iconName={signal(point.strength)} />
          <label
            class={cs.name}
            label={point.ssid}
            xalign={0}
            maxWidthChars={1}
            ellipsize={Pango.EllipsizeMode.END}
            hexpand
          />
          <label class={cs.saved} label={t.saved()} visible={point.saved} />
          <image class={cs.lock} iconName={icons.lock} visible={point.secure} />
          <label class={cs.strength} label={percent(point.strength)} xalign={1} />
        </box>
      </button>

      <label class={cs.busy} label={t.connecting()} xalign={0} visible={connecting} />

      <box class={cs.form} orientation={Gtk.Orientation.VERTICAL} visible={open}>
        <box class={wrong.as((it) => clsx(cs.field, it && cs.failed))} valign={Gtk.Align.CENTER}>
          <entry
            class={cs.input}
            placeholderText={t.password()}
            visibility={props.reveal}
            hexpand
            onNotifyText={(self: Gtk.Entry) => props.onPassword(self.text)}
            onActivate={() => props.onSubmit(point, props.password())}
          />
          <button
            class={cs.reveal}
            tooltipText={t.showPassword()}
            focusable={false}
            onClicked={props.onReveal}>
            <image iconName={props.reveal.as((it) => (it ? icons.eyeOff : icons.eye))} />
          </button>
        </box>
        <box class={cs.actions}>
          <button
            class={cs.submit}
            focusable={false}
            onClicked={() => props.onSubmit(point, props.password())}>
            <label label={t.connect()} />
          </button>
        </box>
        <label class={cs.error} label={t.wrongPassword()} xalign={0} wrap visible={wrong} />
      </box>
    </box>
  )
}

type EmptyProps = {
  readonly visible: Accessor<boolean>
  readonly title: string
  readonly hint: string
}

function WifiEmpty({ visible, title, hint }: EmptyProps) {
  return (
    <box class={cs.empty} orientation={Gtk.Orientation.VERTICAL} visible={visible}>
      <label class={cs.emptyTitle} label={title} />
      <label class={cs.emptyHint} label={hint} wrap justify={Gtk.Justification.CENTER} />
    </box>
  )
}
