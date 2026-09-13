import GdkPixbuf from 'gi://GdkPixbuf'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

import type { WallpaperImage } from '../store/state'

const ATTRIBUTES = 'standard::name,standard::type,standard::content-type,time::modified'

export const thumbnailDir = GLib.build_filenamev([GLib.get_user_cache_dir(), 'pyk', 'wallpapers'])

export interface Scanned {
  readonly image: WallpaperImage
  readonly target: string
}

function thumbnailPath(path: string, modified: number): string {
  const key = GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, `${path}:${modified}`, -1)
  return GLib.build_filenamev([thumbnailDir, `${key}.png`])
}

export function scan(directory: string): readonly Scanned[] {
  const dir = Gio.File.new_for_path(directory)
  if (!GLib.file_test(directory, GLib.FileTest.IS_DIR)) return []

  const children = dir.enumerate_children(ATTRIBUTES, Gio.FileQueryInfoFlags.NONE, null)
  const found: Scanned[] = []

  try {
    for (let info = children.next_file(null); info; info = children.next_file(null)) {
      if (info.get_file_type() !== Gio.FileType.REGULAR) continue
      if (!info.get_content_type()?.startsWith('image/')) continue

      const path = GLib.build_filenamev([directory, info.get_name()])
      const [format, width, height] = GdkPixbuf.Pixbuf.get_file_info(path)
      if (!format) continue

      const target = thumbnailPath(path, info.get_modification_date_time()?.to_unix() ?? 0)

      found.push({
        target,
        image: {
          path,
          name: info.get_name(),
          width,
          height,
          thumbnail: GLib.file_test(target, GLib.FileTest.EXISTS) ? target : null,
        },
      })
    }
  }
  finally {
    children.close(null)
  }

  return found.sort((a, b) => a.image.name.localeCompare(b.image.name))
}
