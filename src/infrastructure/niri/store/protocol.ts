import { Effect, Result, Schema } from 'effect'

import { DecodeError, logFailure } from '@/infrastructure/effect'

import { NiriEvent, NiriEventHandled } from '../schema'

const decodeNiriEvent = Schema.decodeUnknownResult(NiriEvent)

function skipped(line: string): Effect.Effect<Result.Result<NiriEvent, string>> {
  return Effect.succeed(Result.fail(line))
}

function malformed(line: string, cause: unknown): Effect.Effect<Result.Result<NiriEvent, string>> {
  return logFailure(new DecodeError({ domain: 'niri', input: line, cause })).pipe(
    Effect.as(Result.fail(line)),
  )
}

export function decodeEvent(line: string): Effect.Effect<Result.Result<NiriEvent, string>> {
  let raw: unknown

  try {
    raw = JSON.parse(line)
  }
  catch (cause) {
    return malformed(line, cause)
  }

  if (typeof raw !== 'object' || raw === null) return skipped(line)

  const entry = Object.entries(raw)[0]

  if (!entry || !NiriEventHandled.has(entry[0] as NiriEvent['kind'])) return skipped(line)

  const decoded = decodeNiriEvent({ kind: entry[0], ...(entry[1] as object) })

  return Result.isFailure(decoded)
    ? malformed(line, decoded.failure)
    : Effect.succeed(Result.succeed(decoded.success))
}
