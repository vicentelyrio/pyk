import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { FileHit } from '../store/state'
import { rank } from './rank'

function hit(path: string, isDirectory = false): FileHit {
  const at = path.lastIndexOf('/')
  return { path, name: path.slice(at + 1), parent: path.slice(0, at), isDirectory, iconName: '' }
}

describe('files rank', () => {
  test('name prefix beats substring, then shallower paths win', () => {
    const hits = [
      hit('/home/me/a/b/c/notes.md'),
      hit('/home/me/old-notes.txt'),
      hit('/home/me/notes.md'),
      hit('/home/me/notes', true),
    ]

    assert.deepEqual(rank(hits, 'notes', 8).map((it) => it.path), [
      '/home/me/notes',
      '/home/me/notes.md',
      '/home/me/a/b/c/notes.md',
      '/home/me/old-notes.txt',
    ])
  })

  test('caps to the limit', () => {
    assert.equal(rank([hit('/a/x1'), hit('/a/x2'), hit('/a/x3')], 'x', 2).length, 2)
  })
})
