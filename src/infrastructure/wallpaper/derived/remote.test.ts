import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { displayName, downloadUrl, isRemote, remoteSources } from './remote'

describe('downloadUrl', () => {
  it('rewrites unsplash photo pages to the download endpoint', () => {
    const expected = 'https://unsplash.com/photos/jyieoy83hUc/download'
    assert.equal(downloadUrl('https://unsplash.com/photos/jyieoy83hUc'), expected)
    assert.equal(downloadUrl('https://unsplash.com/photos/a-camera-on-a-tripod-jyieoy83hUc'), expected)
    assert.equal(downloadUrl('https://unsplash.com/pt-br/fotografias/a-camera-jyieoy83hUc?utm=x'), expected)
  })

  it('keeps ids that contain dashes', () => {
    assert.equal(downloadUrl('https://unsplash.com/photos/snowy-peaks-a-B_c-12345'), 'https://unsplash.com/photos/a-B_c-12345/download')
  })

  it('leaves direct image urls alone', () => {
    const direct = 'https://images.unsplash.com/photo-1779896412253-b5c31454aed9?fm=jpg'
    assert.equal(downloadUrl(direct), direct)
    assert.equal(downloadUrl('https://example.com/a.png'), 'https://example.com/a.png')
  })
})

describe('remoteSources', () => {
  it('collects unique remote values, list first', () => {
    assert.deepEqual(
      remoteSources({
        image: 'https://a/x.png',
        urls: ['https://b/y.png', 'https://a/x.png'],
        outputs: { 'DP-1': '/local.png', 'DP-2': 'https://c/z.png' },
      }),
      ['https://b/y.png', 'https://a/x.png', 'https://c/z.png'],
    )
    assert.equal(isRemote('~/Pictures/a.png'), false)
  })
})

describe('displayName', () => {
  it('shows basenames for files and hosts for urls', () => {
    assert.equal(displayName('/home/me/Pictures/flowers.png'), 'flowers.png')
    assert.equal(displayName('https://www.unsplash.com/photos/abc'), 'unsplash.com/photos/abc')
    assert.equal(displayName('https://images.unsplash.com/photo-1632?q=80&w=2574'), 'images.unsplash.com/photo-1632')
  })
})
