import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { formatUptime, parseOsRelease } from './uptime'

describe('host', () => {
  test('uptime keeps the two most significant units', () => {
    assert.equal(formatUptime(42), 'up 0m')
    assert.equal(formatUptime(11_520), 'up 3h 12m')
    assert.equal(formatUptime(3 * 86_400 + 5 * 3600 + 59), 'up 3d 5h')
  })

  test('distro comes from the os-release ID, like the design', () => {
    assert.equal(parseOsRelease('NAME="Arch Linux"\nPRETTY_NAME="Arch Linux"\nID=arch\n'), 'arch')
    assert.equal(parseOsRelease('NAME="Fedora Linux"\n'), 'fedora linux')
    assert.equal(parseOsRelease(''), 'linux')
  })
})
