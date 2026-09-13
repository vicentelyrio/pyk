import { Gdk, Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'

const cs = {
  root: 'app-icon',
}

const icons = {
  fallback: 'application-x-executable',
}

export type AppIconProps = {
  readonly icon: string
  readonly className?: string
}

export function AppIcon({ icon, className }: AppIconProps) {
  if (icon.startsWith('/')) {
    return <image class={clsx(cs.root, className)} file={icon} />
  }

  return <image class={clsx(cs.root, className)} iconName={resolve(icon)} />
}

function resolve(icon: string): string {
  const display = Gdk.Display.get_default()
  if (!icon || !display) return icons.fallback
  return Gtk.IconTheme.get_for_display(display).has_icon(icon) ? icon : icons.fallback
}
