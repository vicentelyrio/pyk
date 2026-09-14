import GLib from 'gi://GLib'
import { createComputed } from 'ags'

import { clock } from '@/infrastructure/clock'

import { formatUptime, parseOsRelease } from './derived'

function readText(path: string): string {
  try {
    const [, bytes] = GLib.file_get_contents(path)
    return new TextDecoder().decode(bytes)
  }
  catch {
    return ''
  }
}

function uptimeSeconds(): number {
  return Number.parseFloat(readText('/proc/uptime').split(' ')[0] ?? '0') || 0
}

const userName = GLib.get_user_name()
const realName = GLib.get_real_name()

export const host = {
  userName,
  displayName: realName && realName !== 'Unknown' ? realName : userName,
  distro: parseOsRelease(readText('/etc/os-release')),
  uptime: createComputed(() => {
    clock.now()
    return formatUptime(uptimeSeconds())
  }),
} as const
