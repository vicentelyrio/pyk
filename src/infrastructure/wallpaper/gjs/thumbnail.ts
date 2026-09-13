import GdkPixbuf from 'gi://GdkPixbuf'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

import { thumbnailDir } from './scan'

const WIDTH = 480

export function createThumbnail(path: string, target: string): Promise<string> {
  const file = Gio.File.new_for_path(path)

  return new Promise((resolve, reject) => {
    file.read_async(GLib.PRIORITY_LOW, null, (_file, opened) => {
      try {
        const stream = file.read_finish(opened)

        GdkPixbuf.Pixbuf.new_from_stream_at_scale_async(stream, WIDTH, -1, true, null, (_source, loaded) => {
          try {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_stream_finish(loaded)
            GLib.mkdir_with_parents(thumbnailDir, 0o755)
            pixbuf.savev(target, 'png', null, null)
            resolve(target)
          }
          catch (cause) {
            reject(cause)
          }
          finally {
            stream.close(null)
          }
        })
      }
      catch (cause) {
        reject(cause)
      }
    })
  })
}
