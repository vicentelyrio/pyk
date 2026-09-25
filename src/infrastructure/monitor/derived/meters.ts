import type { Meter, MonitorState } from '../store/state'
import type { Readings } from './parse'

export const HISTORY = 30

const GIB = 1024 ** 3
const TEMP_FLOOR = 30
const TEMP_CEIL = 100

export interface History {
  readonly previous: Readings | null
  readonly cpu: readonly number[]
  readonly mem: readonly number[]
  readonly net: readonly number[]
  readonly temp: readonly number[]
  readonly rate: number
  readonly hasTemp: boolean
}

export const emptyHistory: History = {
  previous: null,
  cpu: [],
  mem: [],
  net: [],
  temp: [],
  rate: 0,
  hasTemp: false,
}

function push(series: readonly number[], value: number): readonly number[] {
  return [...series, value].slice(-HISTORY)
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

export function advance(history: History, next: Readings): History {
  const previous = history.previous
  if (!previous) return { ...history, previous: next, hasTemp: next.temp !== null }

  const total = next.cpuTotal - previous.cpuTotal
  const cpu = total > 0 ? clamp((next.cpuBusy - previous.cpuBusy) / total) : 0
  const mem = next.memTotal > 0 ? clamp(1 - next.memAvailable / next.memTotal) : 0
  const seconds = (next.at - previous.at) / 1000
  const rate = seconds > 0 ? Math.max(next.netBytes - previous.netBytes, 0) / seconds : 0

  return {
    previous: next,
    cpu: push(history.cpu, cpu),
    mem: push(history.mem, mem),
    net: push(history.net, rate),
    temp: next.temp === null ? history.temp : push(history.temp, next.temp),
    rate,
    hasTemp: next.temp !== null,
  }
}

function relative(series: readonly number[]): readonly number[] {
  const peak = Math.max(...series, 1024)
  return series.map((it) => it / peak)
}

function between(series: readonly number[], floor: number, ceil: number): readonly number[] {
  return series.map((it) => clamp((it - floor) / (ceil - floor)))
}

export function formatRate(bytes: number): string {
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)}MB/s`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB/s`
  return `${Math.round(bytes)}B/s`
}

export function formatMemory(used: number, total: number): string {
  return `${Math.round(used / GIB)}/${Math.round(total / GIB)}Gi`
}

export function toState(history: History): MonitorState {
  const last = history.previous
  if (!last || history.cpu.length === 0) return { meters: [] }

  const meters: Meter[] = [
    { id: 'cpu', value: `${((history.cpu.at(-1) ?? 0) * 100).toFixed(1)}%`, series: history.cpu },
    { id: 'mem', value: formatMemory(last.memTotal - last.memAvailable, last.memTotal), series: history.mem },
    { id: 'net', value: formatRate(history.rate), series: relative(history.net) },
  ]

  if (history.hasTemp && last.temp !== null) {
    meters.push({ id: 'temp', value: `${Math.round(last.temp)}°C`, series: between(history.temp, TEMP_FLOOR, TEMP_CEIL) })
  }

  return { meters }
}
