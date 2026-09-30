const UNSPLASH_ID_LENGTH = 11

export function isRemote(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

export interface WallpaperSources {
  readonly image: string
  readonly urls: readonly string[]
  readonly outputs: Readonly<Record<string, string>>
}

export function remoteSources(wallpaper: WallpaperSources): readonly string[] {
  return [...new Set([...wallpaper.urls, wallpaper.image, ...Object.values(wallpaper.outputs)].filter(isRemote))]
}

export function displayName(path: string): string {
  return isRemote(path) ? path.replace(/^https?:\/\/(?:www\.)?/i, '').replace(/[?#].*$/, '') : path.slice(path.lastIndexOf('/') + 1)
}

function unsplashId(url: string): string | null {
  const match = /^https?:\/\/(?:www\.)?unsplash\.com\/([^?#]+)/i.exec(url)
  if (!match) return null

  const segments = match[1]!.split('/').filter(Boolean)
  const last = segments.at(-1) ?? ''
  if (segments.length < 2 || last.length < UNSPLASH_ID_LENGTH) return null

  return last.slice(-UNSPLASH_ID_LENGTH)
}

export function downloadUrl(url: string): string {
  const id = unsplashId(url)
  return id ? `https://unsplash.com/photos/${id}/download` : url
}
