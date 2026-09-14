import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { clampLevel, parseDetectBus, parseVcp, toRaw } from './ddcutil'

describe('brightness parsing', () => {
  test('reads the i2c bus from ddcutil detect', () => {
    const detect = 'Display 1\n   I2C bus:          /dev/i2c-3\n   DRM connector:    card1-DP-3\n'
    assert.equal(parseDetectBus(detect), 3)
    assert.equal(parseDetectBus('No displays found'), null)
  })

  test('reads current and max from terse getvcp', () => {
    assert.deepEqual(parseVcp('VCP 10 C 50 100'), { current: 50, max: 100 })
    assert.equal(parseVcp('VCP 10 ERR'), null)
    assert.equal(parseVcp('VCP 10 C 0 0'), null)
  })

  test('levels clamp and scale to the device range', () => {
    assert.equal(clampLevel(1.4), 1)
    assert.equal(clampLevel(-0.2), 0)
    assert.equal(toRaw(0.555, 100), 56)
    assert.equal(toRaw(0.5, 255), 128)
  })
})
