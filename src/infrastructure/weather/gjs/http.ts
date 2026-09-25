import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import Soup from 'gi://Soup?version=3.0'
import { Effect } from 'effect'

import { SourceError } from '@/infrastructure/effect'

const TIMEOUT_SECONDS = 20

export function makeSession(): Soup.Session {
  return new Soup.Session({ timeout: TIMEOUT_SECONDS, user_agent: 'pyk' })
}

export function getJson(session: Soup.Session, url: string): Effect.Effect<unknown, SourceError> {
  const fail = (cause: unknown) =>
    Effect.fail(new SourceError({ domain: 'weather', reason: `GET ${url.split('?')[0]}`, cause }))

  return Effect.callback<unknown, SourceError>((resume) => {
    const message = Soup.Message.new('GET', url)
    if (!message) return resume(fail('invalid url'))

    const cancellable = new Gio.Cancellable()

    session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, cancellable, (_session, result) => {
      try {
        const bytes = session.send_and_read_finish(result)
        const status = message.get_status()
        if (status !== Soup.Status.OK) return resume(fail(`HTTP ${status}`))
        resume(Effect.succeed(JSON.parse(new TextDecoder().decode(bytes.get_data() ?? new Uint8Array()))))
      }
      catch (cause) {
        resume(fail(cause))
      }
    })

    return Effect.sync(() => cancellable.cancel())
  })
}
