import AstalNetwork from 'gi://AstalNetwork'
import { Effect, Layer } from 'effect'

import { ActionError, attempt, attemptPromise } from '@/infrastructure/effect'

import { NetworkBackend } from '../store/backend'
import { stateChanges } from './connection'

export const NetworkBackendLive = Layer.sync(NetworkBackend, () => {
  const network = AstalNetwork.get_default()

  const find = (bssid: string) =>
    network.wifi?.get_access_points().find((point) => point.bssid === bssid) ?? null

  return {
    changes: stateChanges(network),
    toggleWifi: attempt('network', 'toggleWifi', () => {
      const { wifi } = network
      if (wifi) wifi.enabled = !wifi.enabled
    }),
    scan: attempt('network', 'scan', () => {
      network.wifi?.scan()
    }),
    disconnect: attemptPromise('network', 'disconnect', () => {
      const { wifi } = network
      return wifi ? wifi.deactivate_connection() : Promise.resolve()
    }),
    connect: (bssid: string, password: string | null) =>
      Effect.suspend(() => {
        const point = find(bssid)

        if (!point) {
          return Effect.fail(
            new ActionError({ domain: 'network', action: 'connect', cause: `no access point ${bssid}` }),
          )
        }

        return attemptPromise('network', 'connect', () => point.activate(password))
      }),
  }
})
