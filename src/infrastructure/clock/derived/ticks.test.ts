import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { delayToNextTick, floorToUnit, MINUTE, SECOND } from './ticks'

describe('clock ticks', () => {
  test('waits until the next unit boundary', () => {
    assert.equal(delayToNextTick(12 * MINUTE + 15 * SECOND, MINUTE), 45 * SECOND)
    assert.equal(delayToNextTick(12 * MINUTE + 999, SECOND), 1)
  })

  test('a timer landing exactly on the boundary waits a full unit', () => {
    assert.equal(delayToNextTick(12 * MINUTE, MINUTE), MINUTE)
  })

  test('floors to the start of the unit', () => {
    assert.equal(floorToUnit(12 * MINUTE + 59 * SECOND + 999, MINUTE), 12 * MINUTE)
    assert.equal(floorToUnit(12 * MINUTE + 1500, SECOND), 12 * MINUTE + SECOND)
  })
})
