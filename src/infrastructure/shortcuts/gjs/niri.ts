import GLib from 'gi://GLib'

export const niriBindsPath = GLib.build_filenamev([GLib.get_user_config_dir(), 'niri', 'pyk-binds.kdl'])

export function writeNiriBinds(content: string): boolean {
  if (GLib.file_test(niriBindsPath, GLib.FileTest.EXISTS)) {
    const [, bytes] = GLib.file_get_contents(niriBindsPath)
    if (new TextDecoder().decode(bytes) === content) return false
  }

  GLib.mkdir_with_parents(GLib.path_get_dirname(niriBindsPath), 0o755)
  GLib.file_set_contents(niriBindsPath, content)
  return true
}
