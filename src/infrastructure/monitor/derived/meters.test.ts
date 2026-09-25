import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { advance, emptyHistory, formatMemory, formatRate, toState } from './meters'
import { parseCpu, parseMemory, parseNetwork, type Readings } from './parse'

const reading = (patch: Partial<Readings>): Readings => ({
  at: 0,
  cpuBusy: 0,
  cpuTotal: 0,
  memTotal: 32 * 1024 ** 3,
  memAvailable: 22 * 1024 ** 3,
  netBytes: 0,
  temp: 48,
  ...patch,
})

describe('monitor parsing', () => {
  test('cpu counts idle and iowait as idle', () => {
    assert.deepEqual(parseCpu('cpu  100 0 50 800 50 0 0 0 0 0\ncpu0 1 2 3'), { busy: 150, total: 1000 })
  })

  test('memory reads kB fields as bytes', () => {
    assert.deepEqual(parseMemory('MemTotal:  1000 kB\nMemFree: 10 kB\nMemAvailable:  250 kB\n'), { total: 1024000, available: 256000 })
  })

  test('network sums rx and tx without loopback', () => {
    const dev = [
      'Inter-|   Receive',
      ' face |bytes',
      '    lo:   500 1 0 0 0 0 0 0   500 1 0 0 0 0 0 0',
      ' wlan0:  1000 1 0 0 0 0 0 0   200 1 0 0 0 0 0 0',
    ].join('\n')
    assert.equal(parseNetwork(dev), 1200)
  })
})

describe('monitor meters', () => {
  test('the first reading only primes the history', () => {
    assert.deepEqual(toState(advance(emptyHistory, reading({}))), { meters: [] })
  })

  test('deltas become the design labels', () => {
    const first = advance(emptyHistory, reading({ cpuBusy: 0, cpuTotal: 0 }))
    const next = advance(first, reading({ at: 2000, cpuBusy: 62, cpuTotal: 1000, netBytes: 2 * 4.2 * 1024 ** 2 }))
    const values = toState(next).meters.map((it) => [it.id, it.value])

    assert.deepEqual(values, [['cpu', '6.2%'], ['mem', '10/32Gi'], ['net', '4.2MB/s'], ['temp', '48°C']])
  })

  test('no sensor drops the temperature meter', () => {
    const first = advance(emptyHistory, reading({ temp: null }))
    const next = advance(first, reading({ at: 1000, cpuTotal: 10, temp: null }))
    assert.deepEqual(toState(next).meters.map((it) => it.id), ['cpu', 'mem', 'net'])
  })

  test('formatting', () => {
    assert.equal(formatRate(512), '512B/s')
    assert.equal(formatRate(3 * 1024), '3KB/s')
    assert.equal(formatMemory(10 * 1024 ** 3, 32 * 1024 ** 3), '10/32Gi')
  })
})
