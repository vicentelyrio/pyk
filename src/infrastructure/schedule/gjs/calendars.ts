import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import ICalGLib from 'gi://ICalGLib?version=4.0'

import type { ScheduleEvent } from '../derived/agenda'

export interface Window {
  readonly from: number
  readonly to: number
}

export interface Calendar {
  readonly name: string
  readonly path: string
}

export interface Parsed {
  readonly calendars: readonly Calendar[]
  readonly events: readonly ScheduleEvent[]
  readonly issues: readonly string[]
}

const ATTRIBUTES = 'standard::name,standard::type'

function children(directory: string): Gio.FileInfo[] {
  if (!GLib.file_test(directory, GLib.FileTest.IS_DIR)) return []

  const enumerator = Gio.File.new_for_path(directory).enumerate_children(ATTRIBUTES, Gio.FileQueryInfoFlags.NONE, null)
  const found: Gio.FileInfo[] = []

  try {
    for (let info = enumerator.next_file(null); info; info = enumerator.next_file(null)) found.push(info)
  }
  finally {
    enumerator.close(null)
  }

  return found
}

function readText(path: string): string | null {
  if (!GLib.file_test(path, GLib.FileTest.IS_REGULAR)) return null
  const [, bytes] = GLib.file_get_contents(path)
  return new TextDecoder().decode(bytes)
}

function isIcs(info: Gio.FileInfo): boolean {
  return info.get_file_type() === Gio.FileType.REGULAR && info.get_name().toLowerCase().endsWith('.ics')
}

export function calendarsIn(directory: string): readonly Calendar[] {
  const entries = children(directory)
  const nested = entries
    .filter((info) => info.get_file_type() === Gio.FileType.DIRECTORY && !info.get_name().startsWith('.'))
    .map((info) => {
      const path = GLib.build_filenamev([directory, info.get_name()])
      const name = readText(GLib.build_filenamev([path, 'displayname']))?.trim() || info.get_name()
      return { name, path }
    })

  const flat = entries.some(isIcs)
    ? [{ name: GLib.path_get_basename(directory), path: directory }]
    : []

  return [...flat, ...nested].sort((a, b) => a.name.localeCompare(b.name))
}

function expand(root: ICalGLib.Component, calendar: string, window: Window): ScheduleEvent[] {
  const utc = ICalGLib.Timezone.get_utc_timezone()
  const from = ICalGLib.Time.new_from_timet_with_zone(Math.floor(window.from / 1000), false, utc)
  const to = ICalGLib.Time.new_from_timet_with_zone(Math.floor(window.to / 1000), false, utc)
  const kind = ICalGLib.ComponentKind.VEVENT_COMPONENT
  const events: ScheduleEvent[] = []

  const vevents = root.isa() === kind ? [root] : []
  for (let event = root.get_first_component(kind); event; event = root.get_next_component(kind)) vevents.push(event)

  for (const event of vevents) {
    if (event.get_first_property(ICalGLib.PropertyKind.RECURRENCEID_PROPERTY)) continue

    const allDay = event.get_dtstart().is_date()
    const uid = event.get_uid() || event.get_summary() || 'event'

    event.foreach_recurrence(from, to, (_component, span) => {
      const start = span.get_start() * 1000
      events.push({
        id: `${calendar}:${uid}:${start}`,
        calendar,
        title: event.get_summary() || 'Untitled',
        location: event.get_location() || '',
        allDay,
        start,
        end: Math.max(span.get_end() * 1000, start),
      })
    })
  }

  return events
}

export function parseCalendars(directory: string, window: Window): Parsed {
  const calendars = calendarsIn(directory)
  const events: ScheduleEvent[] = []
  const issues: string[] = []

  for (const calendar of calendars) {
    for (const info of children(calendar.path).filter(isIcs)) {
      const path = GLib.build_filenamev([calendar.path, info.get_name()])

      try {
        const text = readText(path)
        const root = text ? ICalGLib.Component.new_from_string(text) : null
        if (!root) {
          issues.push(`${path}: not a calendar`)
          continue
        }
        events.push(...expand(root, calendar.name, window))
      }
      catch (cause) {
        issues.push(`${path}: ${cause instanceof Error ? cause.message : String(cause)}`)
      }
    }
  }

  return { calendars, events, issues }
}
