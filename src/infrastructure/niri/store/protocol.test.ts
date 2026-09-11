import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Effect, Logger, Result } from 'effect'

import { decodeEvent } from './protocol'

function decode(line: string) {
  const logs: string[] = []
  const capture = Logger.make<unknown, void>(({ message }) => {
    logs.push(Array.isArray(message) ? message.join(' ') : String(message))
  })

  const result = Effect.runSync(
    decodeEvent(line).pipe(Effect.provide(Logger.layer([capture]))),
  )

  return { result, logs }
}

describe('decodeEvent', () => {
  test('decodes a handled event', () => {
    const { result, logs } = decode('{"WindowClosed":{"id":7}}')

    assert.ok(Result.isSuccess(result))
    assert.equal(result.success.kind, 'WindowClosed')
    assert.equal(logs.length, 0)
  })

  test('skips an unhandled kind silently', () => {
    const { result, logs } = decode('{"ConfigLoaded":{"failed":false}}')

    assert.ok(Result.isFailure(result))
    assert.deepEqual(logs, [])
  })

  test('logs and skips a malformed payload', () => {
    const { result, logs } = decode('{"WindowClosed":{"id":"not-a-number"}}')

    assert.ok(Result.isFailure(result))
    assert.equal(logs.length, 1)
    assert.match(logs[0], /undecodable payload/)
  })

  test('logs and skips invalid JSON', () => {
    const { result, logs } = decode('{not json')

    assert.ok(Result.isFailure(result))
    assert.equal(logs.length, 1)
  })

  test('skips a non-object payload silently', () => {
    const { result, logs } = decode('42')

    assert.ok(Result.isFailure(result))
    assert.deepEqual(logs, [])
  })

  test('never fails the effect, so the stream survives bad input', () => {
    for (const line of ['', '{}', 'null', '{"WindowClosed":null}']) {
      assert.doesNotThrow(() => decode(line))
    }
  })
})
