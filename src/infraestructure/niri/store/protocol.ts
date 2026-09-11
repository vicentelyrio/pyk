import { Either, Option, Schema } from 'effect'
import { NiriEvent, NiriEventHandled } from '../schema'

const decodeNiriEvent = Schema.decodeUnknownEither(NiriEvent)

export function decodeEvent(line: string): Option.Option<NiriEvent> {
  let raw: unknown

  try {
    raw = JSON.parse(line)
  }
  catch {
    return Option.none()
  }

  if (typeof raw !== 'object' || raw === null)
    return Option.none()

  const entry = Object.entries(raw)[0]

  if (!entry || !NiriEventHandled.has(entry[0] as NiriEvent['kind']))
    return Option.none()

  const decoded = decodeNiriEvent({ kind: entry[0], ...(entry[1] as object) })

  if (Either.isLeft(decoded)) {
    console.error(`niri: malformed ${entry[0]} event:`, decoded.left.message)
    return Option.none()
  }

  return Option.some(decoded.right)
}
