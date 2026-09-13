import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { AppEntry } from '../store/state'
import { kind, score, search } from './search'

function app(name: string, extra: Partial<AppEntry> = {}): AppEntry {
  return {
    id: `${name.toLowerCase()}.desktop`,
    name,
    description: '',
    executable: name.toLowerCase(),
    iconName: '',
    keywords: [],
    categories: [],
    frequency: 0,
    ...extra,
  }
}

const apps = [
  app('Firefox', { keywords: ['browser', 'web'], categories: ['Network', 'WebBrowser'] }),
  app('Kitty', { categories: ['System', 'TerminalEmulator'], frequency: 3 }),
  app('Blender', { categories: ['Graphics'] }),
  app('Blueprint', { description: 'GTK UI designer' }),
  app('Bluetooth Manager', { executable: 'blueman-manager', categories: ['Settings'] }),
  app('Neovim', { executable: 'nvim', categories: ['Utility', 'TextEditor'], frequency: 9 }),
]

describe('apps search', () => {
  test('an empty query lists by frequency, then name, capped', () => {
    assert.deepEqual(search(apps, '  ', 3).map((it) => it.name), ['Neovim', 'Kitty', 'Blender'])
  })

  test('prefix beats word start beats substring beats subsequence', () => {
    assert.ok(score('Blender', 'ble') > score('Bluetooth Manager', 'man'))
    assert.ok(score('Bluetooth Manager', 'man') > score('Firefox', 'ref'))
    assert.ok(score('Firefox', 'ref') > score('Firefox', 'ffox'))
    assert.equal(score('Firefox', 'xyz'), 0)
  })

  test('loose subsequences are rejected and only names match fuzzily', () => {
    assert.equal(score('File Roller', 'fire'), 0)
    assert.equal(score('Firefox', 'ffox', false), 0)
    assert.deepEqual(search([app('File Roller'), app('Firefox')], 'fire', 8).map((it) => it.name), ['Firefox'])
  })

  test('matches name, keywords and executable, ranked by field weight', () => {
    assert.deepEqual(search(apps, 'nvim', 8).map((it) => it.name), ['Neovim'])
    assert.deepEqual(search(apps, 'browser', 8).map((it) => it.name), ['Firefox'])
    assert.deepEqual(search(apps, 'blue', 8).map((it) => it.name), ['Blueprint', 'Bluetooth Manager'])
  })

  test('ties fall back to frequency', () => {
    const tied = [app('Alpha One'), app('Alpha Two', { frequency: 5 })]
    assert.deepEqual(search(tied, 'alpha', 8).map((it) => it.name), ['Alpha Two', 'Alpha One'])
  })

  test('kind prefers the most specific category', () => {
    assert.equal(kind(apps[0]!), 'web')
    assert.equal(kind(apps[1]!), 'terminal')
    assert.equal(kind(apps[5]!), 'editor')
    assert.equal(kind(apps[3]!), 'app')
  })
})
