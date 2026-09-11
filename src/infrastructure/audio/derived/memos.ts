import { Accessor, createMemo } from 'ags'

import type { AudioState } from '../store/state'

export function speaker(state: Accessor<AudioState>) {
  return {
    hasSpeaker: createMemo(() => state().hasSpeaker),
    volume: createMemo(() => state().volume),
    isMuted: createMemo(() => state().isMuted),
    icon: createMemo(() => state().icon),
    description: createMemo(() => state().description),
  }
}
