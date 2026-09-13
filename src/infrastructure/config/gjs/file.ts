import GLib from 'gi://GLib'

import { configSpec, decode, type Config } from '../schema'

export const configDir = GLib.build_filenamev([GLib.get_user_config_dir(), 'pyk'])
export const configPath = GLib.build_filenamev([configDir, 'config.json'])

export type Loaded =
  | { readonly ok: true, readonly config: Config, readonly issues: readonly string[] }
  | { readonly ok: false, readonly reason: string }

export function load(): Loaded {
  if (!GLib.file_test(configPath, GLib.FileTest.EXISTS)) {
    return { ok: true, ...toLoaded(decode(configSpec, {})) }
  }

  try {
    const [, bytes] = GLib.file_get_contents(configPath)
    const raw: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return { ok: true, ...toLoaded(decode(configSpec, raw)) }
  }
  catch (cause) {
    return { ok: false, reason: cause instanceof Error ? cause.message : String(cause) }
  }
}

export function save(value: unknown): void {
  GLib.mkdir_with_parents(configDir, 0o755)
  GLib.file_set_contents(configPath, `${JSON.stringify(value, null, 2)}\n`)
}

function toLoaded(decoded: ReturnType<typeof decode<typeof configSpec>>) {
  return { config: decoded.value, issues: decoded.issues }
}
