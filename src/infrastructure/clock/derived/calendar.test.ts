import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { daysInMonth, isoWeek, monthView, shiftMonth } from './calendar'

const today = { year: 2026, month: 9, day: 8 }

describe('calendar', () => {
  test('month lengths, including leap years', () => {
    assert.equal(daysInMonth({ year: 2026, month: 9 }), 30)
    assert.equal(daysInMonth({ year: 2024, month: 2 }), 29)
    assert.equal(daysInMonth({ year: 2026, month: 2 }), 28)
  })

  test('iso weeks match the design and wrap across years', () => {
    assert.equal(isoWeek(today), 37)
    assert.equal(isoWeek({ year: 2027, month: 1, day: 1 }), 53)
    assert.equal(isoWeek({ year: 2026, month: 1, day: 1 }), 1)
  })

  test('shifting months crosses year boundaries both ways', () => {
    assert.deepEqual(shiftMonth({ year: 2026, month: 12 }, 1), { year: 2027, month: 1 })
    assert.deepEqual(shiftMonth({ year: 2026, month: 1 }, -1), { year: 2025, month: 12 })
    assert.deepEqual(shiftMonth({ year: 2026, month: 9 }, -21), { year: 2024, month: 12 })
  })

  test('september 2026 starting monday matches the design grid', () => {
    const view = monthView({ year: 2026, month: 9 }, today, 'monday')
    assert.equal(view.rows.length, 5)
    assert.deepEqual(view.rows[0]!.map((it) => it.day), [null, 1, 2, 3, 4, 5, 6])
    assert.deepEqual(view.rows[4]!.map((it) => it.day), [28, 29, 30, null, null, null, null])
    assert.equal(view.rows.flat().filter((it) => it.today).map((it) => it.day)[0], 8)
    assert.equal(view.week, 37)
  })

  test('sunday start shifts the lead and today only marks the current month', () => {
    const view = monthView({ year: 2026, month: 9 }, today, 'sunday')
    assert.deepEqual(view.rows[0]!.map((it) => it.day), [null, null, 1, 2, 3, 4, 5])

    const other = monthView({ year: 2026, month: 10 }, today, 'monday')
    assert.equal(other.rows.flat().some((it) => it.today), false)
    assert.equal(other.week, 40)
  })

  test('a month starting on the week start has no leading blanks', () => {
    const view = monthView({ year: 2021, month: 2 }, today, 'monday')
    assert.equal(view.rows.length, 4)
    assert.equal(view.rows[0]![0]!.day, 1)
  })
})
