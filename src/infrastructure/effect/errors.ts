import { Data } from 'effect'

export type Domain = 'apps' | 'audio' | 'bluetooth' | 'clock' | 'config' | 'mpris' | 'network' | 'niri' | 'notifications' | 'schedule' | 'shortcuts' | 'wallpaper'

export class ActionError extends Data.TaggedError('ActionError')<{
  readonly domain: Domain
  readonly action: string
  readonly cause: unknown
}> {
  override get message(): string {
    return `${this.domain}.${this.action} failed`
  }
}

export class SourceError extends Data.TaggedError('SourceError')<{
  readonly domain: Domain
  readonly reason: string
  readonly cause?: unknown
}> {
  override get message(): string {
    return `${this.domain} source: ${this.reason}`
  }
}

export class DecodeError extends Data.TaggedError('DecodeError')<{
  readonly domain: Domain
  readonly input: string
  readonly cause: unknown
}> {
  override get message(): string {
    return `${this.domain}: undecodable payload`
  }
}

export type PykError = ActionError | SourceError | DecodeError

export function annotations(error: PykError): Record<string, string> {
  return {
    domain: error.domain,
    error: error._tag,
    ...(error._tag === 'ActionError' ? { action: error.action } : {}),
  }
}
