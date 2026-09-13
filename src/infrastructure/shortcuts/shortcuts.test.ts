import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { configSpec, decode } from '@/infrastructure/config/schema'

import { parse } from './accelerator'
import { renderBinds } from './niri/binds'

describe('shortcuts', () => {
  test('parses niri-style accelerators', () => {
    assert.deepEqual(parse('Mod+Shift+Space'), { key: 'Space', ctrl: false, alt: false, shift: true, super: true })
    assert.deepEqual(parse('Ctrl+J'), { key: 'J', ctrl: true, alt: false, shift: false, super: false })
    assert.deepEqual(parse('Escape'), { key: 'Escape', ctrl: false, alt: false, shift: false, super: false })
    assert.equal(parse('Hyper+J'), null)
    assert.equal(parse('Ctrl+'), null)
  })

  test('renders global shortcuts as a niri binds block', () => {
    assert.equal(
      renderBinds({ launcher: ['Mod+Space', 'Mod+D'] }, 'pyk'),
      'binds {\n'
      + '    Mod+Space hotkey-overlay-title="Toggle launcher" { spawn "ags" "request" "-i" "pyk" "launcher"; }\n'
      + '    Mod+D hotkey-overlay-title="Toggle launcher" { spawn "ags" "request" "-i" "pyk" "launcher"; }\n'
      + '}\n',
    )
  })

  test('drops duplicate keys and renders nothing when unbound', () => {
    assert.equal(renderBinds({ launcher: ['Mod+Space', 'mod+space'] }, 'pyk').split('\n').length, 4)
    assert.equal(renderBinds({ launcher: [] }, 'pyk'), '')
  })

  test('config rejects malformed shortcuts per key', () => {
    const { value, issues } = decode(configSpec, {
      shortcuts: { global: { launcher: ['Mod+Space', 'not a key'] }, launcher: { close: ['Ctrl+W'] } },
    })

    assert.deepEqual(value.shortcuts.global.launcher, ['Mod+Space'])
    assert.deepEqual(value.shortcuts.launcher.close, ['Ctrl+W'])
    assert.equal(issues.length, 1)
  })
})
