import { For, createBinding, createComputed } from 'ags'
import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import { Niri, type Workspace } from '@/infraestructure/niri'

export function Workspaces({ className }: { className?: string }) {
  const niri = Niri.get_default()
  const workspaces = createBinding(niri, 'workspaces')
  const focusedId = createBinding(niri, 'focusedId')

  return (
    <box class={clsx('workspaces', className)} valign={Gtk.Align.CENTER}>
      <For each={workspaces} id={(ws: Workspace) => ws.id}>
        {(ws: Workspace) => (
          <button
            valign={Gtk.Align.CENTER}
            class={createComputed(() => {
              const w = workspaces().find((x) => x.id === ws.id) ?? ws
              return clsx(
                'workspaces-workspace',
                focusedId() === ws.id && 'focused',
                w.is_active && 'occupied',
              )
            })}
            tooltipText={ws.name ?? `Workspace ${ws.idx}`}
            onClicked={() => niri.focusWorkspace(ws.idx)}
          />
        )}
      </For>
    </box>
  )
}

