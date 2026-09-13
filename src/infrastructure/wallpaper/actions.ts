import { dispatch } from '@/infrastructure/runtime'

import { Wallpaper } from './store'

export function assign(connector: string, path: string): void {
  dispatch(Wallpaper, (wallpaper) => wallpaper.assign(connector, path))
}
