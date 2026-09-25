import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { labelOf } from './condition'
import { decodeForecast, decodePlace } from './decode'
import { upcoming } from './forecast'

const HOUR = 3_600_000

describe('weather', () => {
  test('decodes the first geocoding match', () => {
    assert.deepEqual(decodePlace({ results: [{ name: 'Lisbon', latitude: 38.7, longitude: -9.1 }] }), { name: 'Lisbon', latitude: 38.7, longitude: -9.1 })
    assert.equal(decodePlace({}), null)
  })

  test('decodes a forecast payload', () => {
    const state = decodeForecast({
      current: { temperature_2m: 14.2, apparent_temperature: 13, weather_code: 61, is_day: 1 },
      hourly: { time: [3600, 7200], temperature_2m: [15, 16], is_day: [1, 0] },
      daily: { temperature_2m_max: [17], temperature_2m_min: [12] },
    }, 'Lisbon', 'metric')

    assert.equal(state?.temperature, 14.2)
    assert.equal(state?.high, 17)
    assert.deepEqual(state?.hours, [
      { time: 3_600_000, temperature: 15, isDay: true },
      { time: 7_200_000, temperature: 16, isDay: false },
    ])
    assert.equal(decodeForecast({ current: {} }, 'x', 'metric'), null)
  })

  test('labels WMO codes', () => {
    assert.equal(labelOf(61), 'lightRain')
    assert.equal(labelOf(63), 'rain')
    assert.equal(labelOf(0), 'clear')
    assert.equal(labelOf(95), 'storm')
  })

  test('upcoming starts an hour out and steps', () => {
    const hours = Array.from({ length: 12 }, (_, at) => ({ time: at * HOUR, temperature: at, isDay: true }))
    assert.deepEqual(upcoming(hours, 1.5 * HOUR, 4, 2).map((it) => it.temperature), [3, 5, 7, 9])
  })
})
