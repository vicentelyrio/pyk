export interface WallpaperImage {
  readonly path: string
  readonly name: string
  readonly width: number
  readonly height: number
  readonly thumbnail: string | null
}

export interface WallpaperGallery {
  readonly directory: string
  readonly images: readonly WallpaperImage[]
}

export interface WallpaperRemote {
  readonly remote: readonly WallpaperImage[]
  readonly files: Readonly<Record<string, string>>
}

export interface WallpaperState extends WallpaperGallery, WallpaperRemote {}

export const emptyRemote: WallpaperRemote = {
  remote: [],
  files: {},
}

export const emptyState: WallpaperState = {
  directory: '',
  images: [],
  ...emptyRemote,
}
