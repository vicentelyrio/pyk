import app from 'ags/gtk4/app'
import { wallpaper } from '@/infrastructure/wallpaper'

export type WallpaperDirection = 'next' | 'previous'

export const wallpaperKeys = {
  step: (direction: WallpaperDirection) => {
    const paths = wallpaper.paths()
    if (paths.length === 0) return

    const offset = direction === 'next' ? 1 : -1
    for (const { connector } of app.get_monitors()) {
      if (!connector) continue
      const index = paths.indexOf(wallpaper.source(connector)())
      wallpaper.assign(connector, paths[(index + offset + paths.length) % paths.length]!)
    }
  },
}
