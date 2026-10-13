import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { appOf, fillTemplate, localPath, matchRule, originOf } from './channel'

const track = (url: string) => ({ url, artist: 'The Replacements', title: "Can't Hardly Wait", album: '' })

describe('originOf', () => {
  it('uses the host for web urls', () => {
    assert.equal(originOf('https://music.youtube.com/watch?v=Uc7kChb99as&list=RD'), 'music.youtube.com')
    assert.equal(originOf('http://user@Example.com:8080/a'), 'example.com')
  })

  it('marks local media as file', () => {
    assert.equal(originOf('file:///home/me/Music/a.flac'), 'file')
  })

  it('is empty for anything else', () => {
    assert.equal(originOf(''), '')
    assert.equal(originOf('spotify:track:123'), '')
  })
})

describe('localPath', () => {
  it('decodes file urls', () => {
    assert.equal(localPath('file:///home/me/My%20Music/a.flac'), '/home/me/My Music/a.flac')
    assert.equal(localPath('https://example.com/a.flac'), null)
  })
})

describe('appOf', () => {
  it('prefers the desktop entry', () => {
    assert.equal(appOf('Spotify', 'org.mpris.MediaPlayer2.spotify'), 'spotify')
  })

  it('falls back to the bus name without instance suffix', () => {
    assert.equal(appOf('', 'org.mpris.MediaPlayer2.firefox.instance_1_68'), 'firefox')
  })
})

describe('matchRule', () => {
  const rules = [
    { match: 'music.youtube.com', name: 'YouTube Music', cover: 'a' },
    { match: 'youtube.com', name: 'YouTube', cover: 'b' },
    { match: 'spotify', name: 'Spotify', cover: '' },
  ]

  it('takes the first rule matching the origin or a parent domain', () => {
    assert.equal(matchRule(rules, { app: 'firefox', origin: 'music.youtube.com' })?.name, 'YouTube Music')
    assert.equal(matchRule(rules, { app: 'firefox', origin: 'www.youtube.com' })?.name, 'YouTube')
  })

  it('matches the app', () => {
    assert.equal(matchRule(rules, { app: 'spotify', origin: '' })?.name, 'Spotify')
  })

  it('does not match partial labels', () => {
    assert.equal(matchRule(rules, { app: 'firefox', origin: 'notyoutube.com' }), null)
    assert.equal(matchRule(rules, { app: '', origin: '' }), null)
  })
})

describe('fillTemplate', () => {
  it('fills query, path and host from the track url', () => {
    const url = 'https://www.youtube.com/watch?v=Uc7kChb99as'
    assert.equal(fillTemplate('https://i.ytimg.com/vi/{query.v}/mqdefault.jpg', track(url)), 'https://i.ytimg.com/vi/Uc7kChb99as/mqdefault.jpg')
    assert.equal(fillTemplate('{host}/{path.1}', track('https://example.com/shorts/abc')), 'example.com/abc')
  })

  it('encodes metadata', () => {
    assert.equal(fillTemplate('https://x/?q={artist}+{title}', track('')), "https://x/?q=The%20Replacements+Can't%20Hardly%20Wait")
  })

  it('gives up when a placeholder is empty or unknown', () => {
    assert.equal(fillTemplate('{query.v}', track('https://www.youtube.com/feed')), null)
    assert.equal(fillTemplate('{album}', track('')), null)
    assert.equal(fillTemplate('{nope}', track('')), null)
  })
})
