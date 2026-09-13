import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'

const cs = {
  root: 'popover',
  content: 'popover-content',
}

export type PopoverProps = {
  readonly trigger: JSX.Element
  readonly children?: JSX.Element | JSX.Element[]
  readonly className?: string
  readonly contentClassName?: string
  readonly tooltip?: string
  readonly position?: Gtk.PositionType
  readonly hasArrow?: boolean
  readonly halign?: Gtk.Align
}

export function Popover({
  trigger,
  children,
  className,
  contentClassName,
  tooltip,
  position = Gtk.PositionType.BOTTOM,
  hasArrow = false,
  halign = Gtk.Align.CENTER,
}: PopoverProps) {
  return (
    <menubutton
      class={clsx(cs.root, className)}
      child={trigger as Gtk.Widget}
      tooltipText={tooltip}
      halign={halign}
      valign={Gtk.Align.CENTER}>
      <popover
        class={clsx(cs.content, contentClassName)}
        position={position}
        hasArrow={hasArrow}
        autohide>
        {children}
      </popover>
    </menubutton>
  )
}
