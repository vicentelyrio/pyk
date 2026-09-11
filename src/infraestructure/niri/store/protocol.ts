import { Result, Schema } from 'effect'
import { NiriEvent, NiriEventHandled } from '../schema'

const decodeNiriEvent = Schema.decodeUnknownResult(NiriEvent)

export function decodeEvent(line: string): Result.Result<NiriEvent, string> {
  let raw: unknown

  try {
    raw = JSON.parse(line)
  }
  catch {
    return Result.fail(line)
  }

  if (typeof raw !== 'object' || raw === null)
    return Result.fail(line)

  const entry = Object.entries(raw)[0]

  if (!entry || !NiriEventHandled.has(entry[0] as NiriEvent['kind']))
    return Result.fail(line)

  const decoded = decodeNiriEvent({ kind: entry[0], ...(entry[1] as object) })

  if (Result.isFailure(decoded)) {
    console.error(`niri: malformed ${entry[0]} event:`, decoded.failure.message)
    return Result.fail(line)
  }

  return Result.succeed(decoded.success)
}
