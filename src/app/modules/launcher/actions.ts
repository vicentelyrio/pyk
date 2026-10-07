import { createComputed, type Accessor } from 'ags'
import { todos, type TodoItem } from '@/infrastructure/todos'
import { SECTION_ICONS, SECTIONS, sectionTitle, type LauncherAction } from '@/app/features'
import { bar, type BarSurface } from '@/app/modules/bar'
import { settings } from '@/app/modules/settings'

type Surface = {
  readonly surface: BarSurface
  readonly name: string
  readonly icon: string
  readonly keywords: readonly string[]
}

const SURFACES: readonly Surface[] = [
  { surface: 'control', name: 'Control center', icon: 'pyk-gear-symbolic', keywords: ['quick settings', 'volume', 'brightness', 'battery'] },
  { surface: 'wifi', name: 'Wi-Fi', icon: 'pyk-wifi-symbolic', keywords: ['wifi', 'network', 'internet', 'wireless'] },
  { surface: 'bluetooth', name: 'Bluetooth', icon: 'pyk-bluetooth-symbolic', keywords: ['devices', 'pair', 'headphones'] },
  { surface: 'wallpaper', name: 'Wallpaper', icon: 'pyk-image-symbolic', keywords: ['background', 'image'] },
  { surface: 'notifications', name: 'Notifications', icon: 'pyk-bell-symbolic', keywords: ['alerts', 'do not disturb'] },
  { surface: 'calendar', name: 'Calendar', icon: 'pyk-calendar-symbolic', keywords: ['agenda', 'date', 'schedule'] },
  { surface: 'session', name: 'Power', icon: 'pyk-power-symbolic', keywords: ['session', 'shut down', 'reboot', 'log out', 'lock', 'suspend'] },
]

const TODO_PREFIX = /^todo\s+(.+)$/i

function todoAction(item: TodoItem): LauncherAction {
  return {
    id: `todo:${item.line}:${item.done}`,
    name: item.text,
    description: item.done ? 'Reopen todo' : 'Complete todo',
    keywords: ['todo', 'task'],
    iconName: item.done ? 'pyk-reset-symbolic' : 'pyk-check-symbolic',
    kind: item.done ? 'todo · done' : 'todo',
    run: () => todos.toggle(item.line),
  }
}

export function launcherPrompts(query: string): readonly LauncherAction[] {
  const text = TODO_PREFIX.exec(query.trim())?.[1]?.trim()
  if (!text) return []

  return [{
    id: `todo:add:${text}`,
    name: `Add todo: ${text}`,
    description: 'Append to the todo list',
    keywords: [],
    iconName: 'pyk-plus-symbolic',
    kind: 'todo',
    run: () => todos.add(text),
  }]
}

export function launcherActions(): Accessor<readonly LauncherAction[]> {
  const commands = shellActions()
  return createComputed(() => [...commands, ...todos.items().map(todoAction)])
}

function shellActions(): readonly LauncherAction[] {
  const surfaces = SURFACES.map((it): LauncherAction => ({
    id: `shell:${it.surface}`,
    name: it.name,
    description: `Open ${it.name.toLowerCase()}`,
    keywords: it.keywords,
    iconName: it.icon,
    kind: 'shell',
    run: () => bar.reveal(it.surface),
  }))

  const sections = SECTIONS.map((id): LauncherAction => ({
    id: `settings:${id}`,
    name: `${sectionTitle(id)} settings`,
    description: `Open settings › ${sectionTitle(id)}`,
    keywords: ['settings', 'preferences', sectionTitle(id)],
    iconName: SECTION_ICONS[id],
    kind: 'settings',
    run: () => settings.show(id),
  }))

  return [
    {
      id: 'settings',
      name: 'Settings',
      description: 'Open settings',
      keywords: ['preferences', 'config', 'options'],
      iconName: 'pyk-gear-symbolic',
      kind: 'settings',
      run: () => settings.show(),
    },
    ...surfaces,
    ...sections,
  ]
}
