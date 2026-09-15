import GLib from 'gi://GLib'
import { createState } from 'ags'
import type { OsdFeedback } from '@/app/features'
import { audio } from '@/infrastructure/audio'
import { brightness } from '@/infrastructure/brightness'
import { config } from '@/infrastructure/config'

const [feedback, setFeedback] = createState<OsdFeedback>({ kind: 'volume', value: 0, muted: false })
const [visible, setVisible] = createState(false)

let timer = 0

function stop() {
  if (timer) GLib.source_remove(timer)
  timer = 0
}

function show(next: OsdFeedback) {
  stop()
  setFeedback(next)
  setVisible(true)

  timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, config.osd().timeout, () => {
    timer = 0
    setVisible(false)
    return GLib.SOURCE_REMOVE
  })
}

function watch(): () => void {
  const started = GLib.get_monotonic_time()
  const settled = () => (GLib.get_monotonic_time() - started) / 1000 >= config.osd().settleDelay

  const onAudio = () => {
    if (!settled() || !audio.hasSpeaker()) return
    const muted = audio.isMuted()
    show({ kind: 'volume', value: muted ? 0 : audio.volume(), muted })
  }

  const onBrightness = () => {
    if (!settled() || !brightness.isAvailable()) return
    show({ kind: 'brightness', value: brightness.level(), muted: false })
  }

  const disposers = [
    audio.volume.subscribe(onAudio),
    audio.isMuted.subscribe(onAudio),
    brightness.level.subscribe(onBrightness),
  ]

  return () => {
    stop()
    for (const dispose of disposers) dispose()
  }
}

export const osd = {
  feedback,
  visible,
  watch,
} as const
