import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { configSpec, defaultConfig } from './schema'
import { decode, merge, overrides } from './spec'

describe('config spec', () => {
  test('an empty file decodes to defaults without issues', () => {
    const { value, issues } = decode(configSpec, {})
    assert.deepEqual(value, defaultConfig)
    assert.deepEqual(issues, [])
  })

  test('valid overrides are kept and siblings stay default', () => {
    const { value } = decode(configSpec, { notifications: { toastTimeout: 5000 } })
    assert.equal(value.notifications.toastTimeout, 5000)
    assert.equal(value.notifications.criticalSticky, defaultConfig.notifications.criticalSticky)
    assert.deepEqual(value.appearance, defaultConfig.appearance)
  })

  test('invalid values fall back per key and are reported', () => {
    const { value, issues } = decode(configSpec, {
      appearance: { accent: 'purple', sizeBase: 100, fontFamily: 'Inter' },
      system: { logLevel: 'Loud' },
      bogus: true,
    })

    assert.equal(value.appearance.accent, defaultConfig.appearance.accent)
    assert.equal(value.appearance.sizeBase, defaultConfig.appearance.sizeBase)
    assert.equal(value.appearance.fontFamily, 'Inter')
    assert.equal(value.system.logLevel, defaultConfig.system.logLevel)
    assert.equal(issues.length, 4)
  })

  test('a non-object section is reported and defaulted', () => {
    const { value, issues } = decode(configSpec, { popover: 3 })
    assert.deepEqual(value.popover, defaultConfig.popover)
    assert.equal(issues.length, 1)
  })

  test('overrides keep only values that differ from defaults', () => {
    const next = merge(defaultConfig, {
      appearance: { accent: '#9ecfb0' },
      popover: { hoverCloseDelay: defaultConfig.popover.hoverCloseDelay },
    })

    assert.deepEqual(overrides(configSpec, next), { appearance: { accent: '#9ecfb0' } })
    assert.deepEqual(overrides(configSpec, defaultConfig), {})
  })

  test('overrides round-trip through decode', () => {
    const next = merge(defaultConfig, { system: { logFormat: 'pretty' }, media: { progressInterval: 500 } })
    assert.deepEqual(decode(configSpec, overrides(configSpec, next)).value, next)
  })
})
