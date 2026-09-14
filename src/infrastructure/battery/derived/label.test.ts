import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { batteryLabel } from './label'

describe('battery label', () => {
  test('matches the design format while discharging', () => {
    assert.equal(batteryLabel(0.96, 5 * 3600 + 40 * 60, false), '96% · 5h 40m')
    assert.equal(batteryLabel(0.12, 25 * 60, false), '12% · 25m')
  })

  test('charging and unknown times', () => {
    assert.equal(batteryLabel(0.5, 3600, true), '50% · 1h 0m to full')
    assert.equal(batteryLabel(1, 0, true), '100% · charging')
    assert.equal(batteryLabel(0.8, 0, false), '80%')
  })
})
