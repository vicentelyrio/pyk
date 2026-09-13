import { Context, Stream } from 'effect'

import type { SourceError } from '@/infrastructure/effect'

import type { WallpaperState } from './state'

export class WallpaperBackend extends Context.Service<WallpaperBackend, {
  readonly changes: Stream.Stream<WallpaperState, SourceError>
}>()('pyk/WallpaperBackend') {}
