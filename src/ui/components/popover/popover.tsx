import GLib from 'gi://GLib'
import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import { onCleanup, type Accessor } from 'ags'

const cs = {
  root: 'popover',
  content: 'popover-content',
}

const HOVER_CLOSE_DELAY = 220

export type PopoverTrigger = 'click' | 'hover'

export type PopoverProps = {
  readonly trigger: JSX.Element
  readonly children?: JSX.Element | JSX.Element[]
  readonly on?: PopoverTrigger
  readonly className?: string
  readonly contentClassName?: string
  readonly tooltip?: string
  readonly visible?: boolean | Accessor<boolean>
  readonly position?: Gtk.PositionType
  readonly hasArrow?: boolean
  readonly halign?: Gtk.Align
}

export function Popover({
  trigger,
  children,
  on = 'click',
  className,
  contentClassName,
  tooltip,
  visible = true,
  position = Gtk.PositionType.BOTTOM,
  hasArrow = false,
  halign = Gtk.Align.CENTER,
}: PopoverProps) {
  const content = (
    <popover
      class={clsx(cs.content, contentClassName)}
      position={position}
      hasArrow={hasArrow}
      autohide={on === 'click'}>
      {children}
    </popover>
  ) as Gtk.Popover

  return (
    <box
      class={clsx(cs.root, className)}
      tooltipText={tooltip}
      visible={visible}
      halign={halign}
      valign={Gtk.Align.CENTER}
      $={(self) => attach(self as Gtk.Widget, content, on)}>
      {trigger}
    </box>
  )
}

function attach(anchor: Gtk.Widget, content: Gtk.Popover, on: PopoverTrigger) {
  content.set_parent(anchor)
  onCleanup(() => content.unparent())

  if (on === 'click') {
    const gesture = new Gtk.GestureClick()
    gesture.connect('released', () => content.popup())
    anchor.add_controller(gesture)
    return
  }

  let pending = 0

  const cancel = () => {
    if (!pending) return
    GLib.source_remove(pending)
    pending = 0
  }

  const open = () => {
    cancel()
    content.popup()
  }

  const close = () => {
    cancel()
    pending = GLib.timeout_add(GLib.PRIORITY_DEFAULT, HOVER_CLOSE_DELAY, () => {
      pending = 0
      content.popdown()
      return GLib.SOURCE_REMOVE
    })
  }

  for (const widget of [anchor, content]) {
    const motion = new Gtk.EventControllerMotion()
    motion.connect('enter', open)
    motion.connect('leave', close)
    widget.add_controller(motion)
  }

  onCleanup(cancel)
}
