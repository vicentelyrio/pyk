import GLib from 'gi://GLib'
import { createComputed, createMemo, type Accessor } from 'ags'
import { Equal } from 'effect'

import { collapseHome, config, expandHome } from '@/infrastructure/config'

import { assign } from './actions'
import { wallpaperState } from './bridge'
import { displayName, gallery, isRemote, rows } from './derived'
import type { WallpaperImage } from './store'

const home = GLib.get_home_dir()

const state = gallery(wallpaperState)

const known = createMemo(() => [...state.images(), ...state.remote()], { equals: Equal.equals })

function source(connector: string): Accessor<string> {
  return createComputed(() => {
    const { outputs, image } = config.wallpaper()
    return expandHome(outputs[connector] ?? image, home)
  })
}

function forOutput(connector: string): Accessor<string> {
  const configured = source(connector)
  let last = ''

  return createComputed(() => {
    const value = configured()
    last = isRemote(value) ? state.files()[value] ?? last : value
    return last
  })
}

function find(path: string): WallpaperImage | null {
  return known().find((it) => it.path === path) ?? null
}

export const wallpaper = {
  ...state,
  label: createComputed(() => collapseHome(state.directory(), home)),
  fit: createComputed(() => config.wallpaper().fit),
  paths: createComputed(() => [...state.images().map((it) => it.path), ...config.wallpaper().urls]),
  find,
  source,
  forOutput,
  rows,
  isRemote,
  displayName,
  assign,
} as const
