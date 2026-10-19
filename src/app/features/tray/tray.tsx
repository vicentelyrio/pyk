import Gio from 'gi://Gio'
import { Gdk, Gtk } from 'ags/gtk4'
import { For, createComputed, onCleanup } from 'ags'
import { clsx } from 'clsx'
import { tray } from '@/infrastructure/tray'

const cs = {
  root: 'tray',
  item: 'tray-item',
  icon: 'tray-icon',
  menu: 'tray-menu',
}

const ACTIONS = 'dbusmenu'

const fallback = Gio.ThemedIcon.new('application-x-executable-symbolic')

export type TrayProps = {
  readonly className?: string
}

export function Tray({ className }: TrayProps) {
  return (
    <box class={clsx(cs.root, className)} visible={tray.hasItems}>
      <For each={tray.ids} id={(it: string) => it}>
        {(id: string) => <TrayItem id={id} />}
      </For>
    </box>
  )
}

function TrayItem({ id }: { readonly id: string }) {
  const item = createComputed(() => tray.find(id))
  const menu = Gtk.PopoverMenu.new_from_model(null)
  menu.add_css_class(cs.menu)

  const open = () => {
    if (!item()?.menuModel) return
    tray.aboutToShow(id)
    menu.popup()
  }

  const setup = (self: Gtk.Button) => {
    menu.set_parent(self)
    onCleanup(() => menu.unparent())

    const sync = () => {
      const it = item()
      menu.set_menu_model(it?.menuModel ?? null)
      self.insert_action_group(ACTIONS, it?.actionGroup ?? null)
    }
    sync()
    onCleanup(item.subscribe(sync))

    const click = new Gtk.GestureClick({ button: 0 })
    click.connect('pressed', () => {
      const button = click.get_current_button()
      if (button === Gdk.BUTTON_SECONDARY) open()
      else if (button === Gdk.BUTTON_MIDDLE) tray.secondaryActivate(id, 0, 0)
    })
    self.add_controller(click)
  }

  return (
    <button
      class={cs.item}
      valign={Gtk.Align.CENTER}
      tooltipMarkup={item.as((it) => it?.tooltip || it?.title || '')}
      focusable={false}
      onClicked={() => (item()?.isMenu ? open() : tray.activate(id, 0, 0))}
      $={setup}>
      <image class={cs.icon} gicon={item.as((it) => it?.gicon ?? fallback)} />
    </button>
  )
}
