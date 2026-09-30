import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { evaluate, formatResult } from './calc'

describe('launcher calc', () => {
  test('respects precedence and associativity', () => {
    assert.equal(evaluate('1 + 2 * 3'), 7)
    assert.equal(evaluate('(1 + 2) * 3'), 9)
    assert.equal(evaluate('2 ^ 3 ^ 2'), 512)
    assert.equal(evaluate('-2 ^ 2'), -4)
    assert.equal(evaluate('2 ^ -1'), 0.5)
    assert.equal(evaluate('10 % 4'), 2)
    assert.equal(evaluate('8 ÷ 2 × 3'), 12)
  })

  test('supports functions, constants and implicit multiplication', () => {
    assert.equal(evaluate('sqrt(16) + abs(-2)'), 6)
    assert.equal(evaluate('max(1, 5, 3)'), 5)
    assert.equal(evaluate('2pi'), Math.PI * 2)
    assert.equal(evaluate('2π'), Math.PI * 2)
    assert.equal(evaluate('2(3 + 1)'), 8)
    assert.equal(evaluate('=1.5e3 / 3'), 500)
  })

  test('ignores plain searches, bare values and invalid input', () => {
    for (const query of ['', 'firefox', '42', '-42', 'pi', 'e', '(3)', '1 +', '2 ** 3', 'sqrt 4', '1/0', '10%']) {
      assert.equal(evaluate(query), null, query)
    }
  })

  test('formats away float noise', () => {
    assert.equal(formatResult(0.1 + 0.2), '0.3')
    assert.equal(formatResult(-0), '0')
    assert.equal(formatResult(1 / 3), '0.333333333333')
  })
})
