import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { appendLine, parseTodos, toggleLine } from './todo-txt'

describe('todo.txt', () => {
  test('parses open and done lines, skipping blanks', () => {
    assert.deepEqual(parseTodos('x 2026-09-20 Reserve zone\n\nCut 0.1.0 tag\n'), [
      { line: 0, text: 'Reserve zone', done: true },
      { line: 2, text: 'Cut 0.1.0 tag', done: false },
    ])
  })

  test('toggle round-trips a line', () => {
    const done = toggleLine('a\nb\n', 1)
    assert.equal(done, 'a\nx b\n')
    assert.equal(toggleLine(done, 1), 'a\nb\n')
  })

  test('append adds a trimmed line at the end', () => {
    assert.equal(appendLine('', ' a '), 'a\n')
    assert.equal(appendLine('a', 'b'), 'a\nb\n')
    assert.equal(appendLine('a\n\n', 'b'), 'a\nb\n')
    assert.equal(appendLine('a\n', '  '), 'a\n')
  })

  test('toggle ignores blank and missing lines', () => {
    assert.equal(toggleLine('a\n\n', 1), 'a\n\n')
    assert.equal(toggleLine('a', 5), 'a')
  })
})
