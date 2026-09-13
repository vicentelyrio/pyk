export const MINUTE = 60_000
export const SECOND = 1000

export function delayToNextTick(nowMs: number, unitMs: number): number {
  return unitMs - (nowMs % unitMs)
}

export function floorToUnit(nowMs: number, unitMs: number): number {
  return nowMs - (nowMs % unitMs)
}
