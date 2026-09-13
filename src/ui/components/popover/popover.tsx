import GLib from 'gi://GLib'
import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import { onCleanup, type Accessor } from 'ags'

const cs = {
  root: 'popover',
  content: 'popover-content',

  open: '--open',
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
  const hover = on === 'hover'

  const content = (
    <popover
      class={clsx(cs.content, contentClassName)}
      position={position}
      hasArrow={hasArrow}
      autohide={!hover}>
      {children}
    </popover>
  ) as Gtk.Popover

  if (hover) {
    return (
      <box
        class={clsx(cs.root, className)}
        tooltipText={tooltip}
        visible={visible}
        halign={halign}
        valign={Gtk.Align.CENTER}
        $={(self) => attach(self as Gtk.Widget, content)}>
        {trigger}
      </box>
    )
  }

  return (
    <menubutton
      class={clsx(cs.root, className)}
      child={trigger as Gtk.Widget}
      tooltipText={tooltip}
      visible={visible}
      halign={halign}
      valign={Gtk.Align.CENTER}
      $={(self) => track(self as Gtk.Widget, content)}>
      {content}
    </menubutton>
  )
}

function track(anchor: Gtk.Widget, content: Gtk.Popover) {
  const opened = content.connect('notify::visible', () => {
    if (content.visible) anchor.add_css_class(cs.open)
    else anchor.remove_css_class(cs.open)
  })

  onCleanup(() => content.disconnect(opened))
}

function attach(anchor: Gtk.Widget, content: Gtk.Popover) {
  content.set_parent(anchor)
  track(anchor, content)
  onCleanup(() => content.unparent())

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
