export interface WallpaperImage {
  readonly path: string
  readonly name: string
  readonly width: number
  readonly height: number
  readonly thumbnail: string | null
}

export interface WallpaperState {
  readonly directory: string
  readonly images: readonly WallpaperImage[]
}

export const emptyState: WallpaperState = {
  directory: '',
  images: [],
}
