import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import type { Accessor } from 'ags'

const cs = {
  header: 'panel-header',
  back: 'panel-back',
  title: 'panel-title',
  status: 'panel-status',
  sectionHead: 'panel-section-head',
  sectionLabel: 'panel-section-label',
  empty: 'panel-empty',
  emptyTitle: 'panel-empty-title',
  emptyHint: 'panel-empty-hint',
}

const icons = {
  back: 'pyk-chevron-left-symbolic',
}

export type PanelHeaderProps = {
  readonly title: string
  readonly backTooltip: string
  readonly onBack: () => void
  readonly children?: JSX.Element | JSX.Element[]
}

export function PanelHeader({ title, backTooltip, onBack, children }: PanelHeaderProps) {
  return (
    <box class={cs.header} valign={Gtk.Align.CENTER}>
      <button class={cs.back} tooltipText={backTooltip} focusable={false} onClicked={onBack}>
        <image iconName={icons.back} />
      </button>
      <label class={cs.title} label={title} xalign={0} hexpand />
      {children}
    </box>
  )
}

export function PanelStatus({ label }: { readonly label: Accessor<string> | string }) {
  return <label class={cs.status} label={label} />
}

export type PanelSectionHeadProps = {
  readonly label: string
  readonly children?: JSX.Element | JSX.Element[]
}

export function PanelSectionHead({ label, children }: PanelSectionHeadProps) {
  return (
    <box class={cs.sectionHead} valign={Gtk.Align.CENTER}>
      <label class={cs.sectionLabel} label={label} xalign={0} hexpand />
      {children}
    </box>
  )
}

export type PanelEmptyProps = {
  readonly title: string
  readonly hint: string
  readonly visible?: Accessor<boolean> | boolean
  readonly className?: string
}

export function PanelEmpty({ title, hint, visible = true, className }: PanelEmptyProps) {
  return (
    <box
      class={clsx(cs.empty, className)}
      orientation={Gtk.Orientation.VERTICAL}
      visible={visible}>
      <label class={cs.emptyTitle} label={title} />
      <label class={cs.emptyHint} label={hint} wrap justify={Gtk.Justification.CENTER} />
    </box>
  )
}
