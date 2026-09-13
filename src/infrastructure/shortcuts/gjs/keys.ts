import Gdk from 'gi://Gdk?version=4.0'

import { parse, type Accelerator } from '../accelerator'

const MODIFIERS = Gdk.ModifierType.CONTROL_MASK
  | Gdk.ModifierType.ALT_MASK
  | Gdk.ModifierType.SHIFT_MASK
  | Gdk.ModifierType.SUPER_MASK

function normalize(keyval: number): number {
  return Gdk.keyval_to_lower(keyval === Gdk.KEY_ISO_Left_Tab ? Gdk.KEY_Tab : keyval)
}

function keyvalOf(name: string): number {
  const exact = Gdk.keyval_from_name(name)
  return exact !== Gdk.KEY_VoidSymbol && exact !== 0 ? exact : Gdk.keyval_from_name(name.toLowerCase())
}

function maskOf(accelerator: Accelerator): number {
  return (accelerator.ctrl ? Gdk.ModifierType.CONTROL_MASK : 0)
    | (accelerator.alt ? Gdk.ModifierType.ALT_MASK : 0)
    | (accelerator.shift ? Gdk.ModifierType.SHIFT_MASK : 0)
    | (accelerator.super ? Gdk.ModifierType.SUPER_MASK : 0)
}

export function matches(shortcuts: readonly string[], keyval: number, state: Gdk.ModifierType): boolean {
  const pressed = normalize(keyval)
  const mods = state & MODIFIERS

  return shortcuts.some((shortcut) => {
    const accelerator = parse(shortcut)
    if (!accelerator) return false

    const expected = keyvalOf(accelerator.key)
    if (expected === 0 || expected === Gdk.KEY_VoidSymbol) return false

    return normalize(expected) === pressed && mods === maskOf(accelerator)
  })
}

export type ShortcutHandlers<Action extends string> = Readonly<Record<Action, () => void>>

export function handleShortcut<Action extends string>(
  bindings: Readonly<Record<Action, readonly string[]>>,
  handlers: ShortcutHandlers<Action>,
  keyval: number,
  state: Gdk.ModifierType,
): boolean {
  const action = (Object.keys(handlers) as Action[]).find((it) => matches(bindings[it], keyval, state))
  if (!action) return false

  handlers[action]()
  return true
}
