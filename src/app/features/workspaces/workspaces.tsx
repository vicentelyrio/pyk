import { For, createComputed } from 'ags'
import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import { niri, type Workspace } from '@/infraestructure/niri'

const cs = {
  root: 'workspaces',
  item: 'workspaces-workspace',
  icon: 'workspaces-workspace-icon',
  focused: 'workspaces-workspace-icon--focused',
  occupied: 'workspaces-workspace-icon--occupied',
}

export function Workspaces({ className }: { className?: string }) {
  return (
    <box class={clsx(cs.root, className)} valign={Gtk.Align.CENTER}>
      <For each={niri.workspaces} id={(ws: Workspace) => ws.id}>
        {(ws: Workspace) => (
          <button
            valign={Gtk.Align.CENTER}
            class={cs.item}
            tooltipText={ws.name ?? `Workspace ${ws.idx}`}
            onClicked={() => niri.focusWorkspace(ws.idx)}
          >
            <box
              valign={Gtk.Align.CENTER}
              halign={Gtk.Align.CENTER}
              class={createComputed(() => clsx(
                cs.icon,
                niri.focusedWorkspaceId() === ws.id && cs.focused,
                niri.occupiedIds().has(ws.id) && cs.occupied,
              ))}
            />
          </button>
        )}
      </For>
    </box>
  )
}
