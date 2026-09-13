import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { agendaFor, busyDays, occursOn, type LocalDate, type ScheduleEvent } from './agenda'

const HOUR = 3_600_000
const SAO_PAULO = -3 * HOUR

const local: LocalDate = (ms) => {
  const date = new Date(ms + SAO_PAULO)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}

function timed(title: string, iso: string, hours: number): ScheduleEvent {
  const start = Date.parse(iso)
  return { id: `${title}:${start}`, calendar: 'work', title, location: '', allDay: false, start, end: start + hours * HOUR }
}

function allDay(title: string, from: string, days: number): ScheduleEvent {
  const start = Date.parse(`${from}T00:00:00Z`)
  return { id: `${title}:${start}`, calendar: 'personal', title, location: '', allDay: true, start, end: start + days * 24 * HOUR }
}

const review = timed('Shell design review', '2026-09-08T18:30:00Z', 0.5)
const ship = allDay('Ship 0.1.0 tag', '2026-09-08', 1)
const late = timed('Late deploy', '2026-09-09T01:30:00Z', 1)
const midnight = timed('Night shift', '2026-09-22T01:00:00Z', 4)
const trip = allDay('Trip', '2026-09-29', 4)

describe('schedule agenda', () => {
  test('all-day events cover their date span, end exclusive', () => {
    assert.equal(occursOn(ship, { year: 2026, month: 9, day: 8 }, local), true)
    assert.equal(occursOn(ship, { year: 2026, month: 9, day: 9 }, local), false)
  })

  test('timed events use the local date, not UTC', () => {
    assert.equal(occursOn(late, { year: 2026, month: 9, day: 8 }, local), true)
    assert.equal(occursOn(late, { year: 2026, month: 9, day: 9 }, local), false)
  })

  test('the agenda puts all-day first, then start time', () => {
    const agenda = agendaFor([late, review, ship, trip], { year: 2026, month: 9, day: 8 }, local)
    assert.deepEqual(agenda.map((it) => it.title), ['Ship 0.1.0 tag', 'Shell design review', 'Late deploy'])
  })

  test('busy days include every day an event touches, clipped to the month', () => {
    const days = busyDays([review, ship, late, midnight, trip], { year: 2026, month: 9 }, local)
    assert.deepEqual([...days].sort((a, b) => a - b), [8, 21, 22, 29, 30])

    const october = busyDays([trip], { year: 2026, month: 10 }, local)
    assert.deepEqual([...october].sort((a, b) => a - b), [1, 2])
  })
})
