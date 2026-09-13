import GLib from 'gi://GLib'
import { createComputed, type Accessor } from 'ags'

import { collapseHome, config, expandHome } from '@/infrastructure/config'

import { assign } from './actions'
import { wallpaperState } from './bridge'
import { gallery, rows } from './derived'

const home = GLib.get_home_dir()

function forOutput(connector: string): Accessor<string> {
  return createComputed(() => {
    const { outputs, image } = config.wallpaper()
    return expandHome(outputs[connector] ?? image, home)
  })
}

const state = gallery(wallpaperState)

export const wallpaper = {
  ...state,
  label: createComputed(() => collapseHome(state.directory(), home)),
  fit: createComputed(() => config.wallpaper().fit),
  forOutput,
  rows,
  assign,
} as const
