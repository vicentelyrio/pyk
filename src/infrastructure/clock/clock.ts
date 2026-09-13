import GLib from 'gi://GLib'
import { createComputed, createMemo } from 'ags'

import { config } from '@/infrastructure/config'

import { clockState } from './bridge'

function format(now: number, pattern: string): string {
  return GLib.DateTime.new_from_unix_local(Math.floor(now / 1000))?.format(pattern) ?? ''
}

const now = createMemo(() => clockState().now)

export const clock = {
  now,
  time: createComputed(() => {
    const { hourFormat, showSeconds } = config.clock()
    const hours = hourFormat === '12h' ? '%-I' : '%H'
    const suffix = hourFormat === '12h' ? ' %p' : ''
    return format(now(), `${hours}:%M${showSeconds ? ':%S' : ''}${suffix}`)
  }),
  date: createComputed(() => {
    const { showDate, dateFormat } = config.clock()
    return showDate ? format(now(), dateFormat) : ''
  }),
} as const
