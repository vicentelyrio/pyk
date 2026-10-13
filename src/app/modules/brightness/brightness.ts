import { brightness } from '@/infrastructure/brightness'
import { config } from '@/infrastructure/config'

export type BrightnessDirection = 'up' | 'down'

export const brightnessKeys = {
  step: (direction: BrightnessDirection) => {
    const delta = config.brightness().step / 100
    brightness.adjust(direction === 'up' ? delta : -delta)
  },
}
