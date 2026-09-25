export type WeatherCondition = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm'

export function conditionOf(code: number): WeatherCondition {
  if (code <= 1) return 'clear'
  if (code === 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloudy'
}

export type WeatherLabel = WeatherCondition | 'lightRain' | 'heavyRain' | 'lightSnow' | 'heavySnow'

const LIGHT = new Set([61, 66, 71, 80, 85])
const HEAVY = new Set([65, 67, 75, 82, 86])

export function labelOf(code: number): WeatherLabel {
  const condition = conditionOf(code)
  if (condition === 'rain') return LIGHT.has(code) ? 'lightRain' : HEAVY.has(code) ? 'heavyRain' : 'rain'
  if (condition === 'snow') return LIGHT.has(code) ? 'lightSnow' : HEAVY.has(code) ? 'heavySnow' : 'snow'
  return condition
}
