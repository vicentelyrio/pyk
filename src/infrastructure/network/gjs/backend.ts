import AstalNetwork from 'gi://AstalNetwork'
import { Layer } from 'effect'

import { attempt } from '@/infrastructure/effect'

import { NetworkBackend } from '../store/backend'
import { stateChanges } from './connection'

export const NetworkBackendLive = Layer.sync(NetworkBackend, () => {
  const network = AstalNetwork.get_default()

  return {
    changes: stateChanges(network),
    toggleWifi: attempt('network', 'toggleWifi', () => {
      const { wifi } = network
      if (wifi) wifi.enabled = !wifi.enabled
    }),
  }
})
