import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import { Layer } from 'effect'

import { attemptPromise } from '@/infrastructure/effect'

import { Session } from '../store/backend'

const LOGIND = 'org.freedesktop.login1'

function call(path: string, iface: string, method: string, parameters: GLib.Variant | null): Promise<unknown> {
  return new Promise((resolve, reject) => {
    Gio.DBus.system.call(LOGIND, path, iface, method, parameters, null, Gio.DBusCallFlags.NONE, -1, null, (connection, result) => {
      try {
        resolve(connection!.call_finish(result))
      }
      catch (cause) {
        reject(cause)
      }
    })
  })
}

const manager = (method: string) =>
  attemptPromise('session', method, () =>
    call('/org/freedesktop/login1', `${LOGIND}.Manager`, method, new GLib.Variant('(b)', [true])))

export const SessionLive = Layer.succeed(Session, {
  lock: attemptPromise('session', 'lock', () =>
    call('/org/freedesktop/login1/session/auto', `${LOGIND}.Session`, 'Lock', null)),
  suspend: manager('Suspend'),
  reboot: manager('Reboot'),
  powerOff: manager('PowerOff'),
})
