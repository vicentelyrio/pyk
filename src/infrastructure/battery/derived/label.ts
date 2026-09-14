export function batteryLabel(percentage: number, secondsLeft: number, isCharging: boolean): string {
  const percent = `${Math.round(percentage * 100)}%`
  if (secondsLeft <= 0) return isCharging ? `${percent} · charging` : percent

  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const time = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  return isCharging ? `${percent} · ${time} to full` : `${percent} · ${time}`
}
