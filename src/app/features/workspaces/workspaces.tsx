import { For, createComputed, type Accessor } from 'ags'
import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import { niri, type WorkspaceWindow, type Workspace } from '@/infrastructure/niri'

const cs = {
  root: 'ws',
  workspaces: 'ws-workspaces',
  workspacesItem: 'ws-workspaces-item',
  windows: 'ws-windows',
  windowsItem: 'ws-windows-item',

  focused: '--focused',
  occupied: '--occupied',
  floating: '--floating',
  empty: '--empty',
}

export function Workspaces({ className }: { className?: string }) {
  return (
    <box
      class={clsx(cs.root, className)}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}>
      <WorkspacesNav />
      <WorkspacesWindows />
    </box>
  )
}

function WorkspacesNav() {
  const slots = createComputed(() => {
    const workspaces = niri.workspaces()
    const at = workspaces.findIndex((it) => it.id === niri.focusedWorkspaceId())
    return [workspaces[at - 1] ?? null, workspaces[at] ?? null, workspaces[at + 1] ?? null] as const
  })

  return (
    <box
      class={cs.workspaces}
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}>
      <WorkspaceNavItem workspace={slots.as((it) => it[0])} />
      <WorkspaceNavItem workspace={slots.as((it) => it[1])} />
      <WorkspaceNavItem workspace={slots.as((it) => it[2])} />
    </box>
  )
}

type WorkspaceNavItemProps = {
  readonly workspace: Accessor<Workspace | null>
}

function WorkspaceNavItem({ workspace }: WorkspaceNavItemProps) {
  return (
    <button
      class={createComputed(() => {
        const it = workspace()
        return clsx(
          cs.workspacesItem,
          !it && cs.empty,
          it && niri.focusedWorkspaceId() === it.id && cs.focused,
          it && niri.occupiedIds().has(it.id) && cs.occupied,
        )
      })}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      tooltipText={workspace.as((it) => (it ? (it.name ?? `${it.idx}`) : ''))}
      onClicked={() => {
        const it = workspace()
        if (it) niri.focusWorkspace(it.idx)
      }}
    />
  )
}

function WorkspacesWindows() {
  const windows = createComputed(() => {
    const workspace = niri.workspaces().find((it) => it.id === niri.focusedWorkspaceId())
    return workspace?.windows ?? []
  })

  return (
    <box
      class={cs.windows}
      halign={Gtk.Align.START}
      valign={Gtk.Align.CENTER}>
      <For each={windows} id={(win: WorkspaceWindow) => win.id}>
        {(win: WorkspaceWindow) => <WorkspaceWindowsItem {...win} />}
      </For>
    </box>
  )
}

function WorkspaceWindowsItem({ id, title, appId, isFloating }: WorkspaceWindow) {
  return (
    <button
      class={createComputed(() => clsx(
        cs.windowsItem,
        niri.focusedWindowId() === id && cs.focused,
        isFloating && cs.floating,
      ))}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      tooltipText={title ?? appId ?? ''}
      onClicked={() => niri.focusWindow(id)}
    />
  )
}
