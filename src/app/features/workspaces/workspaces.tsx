import { For, createComputed, type Accessor } from 'ags'
import { Gtk } from 'ags/gtk4'
import { clsx } from 'clsx'
import { niri, type LaneWindow, type WorkspaceLane } from '@/infraestructure/niri'

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

export function WorkspacesNav() {
  const slots = createComputed(() => {
    const lanes = niri.lanes()
    const at = lanes.findIndex((it) => it.id === niri.focusedWorkspaceId())
    return [lanes[at - 1] ?? null, lanes[at] ?? null, lanes[at + 1] ?? null] as const
  })

  return (
    <box
      class={cs.workspaces}
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}>
      <WorkspaceNavItem lane={slots.as((it) => it[0])} />
      <WorkspaceNavItem lane={slots.as((it) => it[1])} />
      <WorkspaceNavItem lane={slots.as((it) => it[2])} />
    </box>
  )
}

type WorkspaceNavItemProps = {
  readonly lane: Accessor<WorkspaceLane | null>
}

export function WorkspaceNavItem({ lane }: WorkspaceNavItemProps) {
  return (
    <button
      class={createComputed(() => {
        const it = lane()
        return clsx(
          cs.workspacesItem,
          !it && cs.empty,
          it && niri.focusedWorkspaceId() === it.id && cs.focused,
          it && niri.occupiedIds().has(it.id) && cs.occupied,
        )
      })}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      tooltipText={lane.as((it) => (it ? (it.name ?? `${it.idx}`) : ''))}
      onClicked={() => {
        const it = lane()
        if (it) niri.focusWorkspace(it.idx)
      }}
    />
  )
}

export function WorkspacesWindows() {
  const windows = createComputed(() => {
    const lane = niri.lanes().find((it) => it.id === niri.focusedWorkspaceId())
    return lane?.windows ?? []
  })

  return (
    <box
      class={cs.windows}
      halign={Gtk.Align.START}
      valign={Gtk.Align.CENTER}>
      <For each={windows} id={(win: LaneWindow) => win.id}>
        {(win: LaneWindow) => <WorkspaceWindowsItem {...win} />}
      </For>
    </box>
  )
}

export function WorkspaceWindowsItem({ id, title, appId, isFloating }: LaneWindow) {
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
