import app from 'ags/gtk4/app'
import { Gtk } from 'ags/gtk4'
import { createState } from 'ags'

const [inhibited, setInhibited] = createState(false)

let cookie = 0

function toggle(): void {
  if (cookie) {
    app.uninhibit(cookie)
    cookie = 0
    setInhibited(false)
    return
  }

  cookie = app.inhibit(app.get_windows()[0] ?? null, Gtk.ApplicationInhibitFlags.IDLE, 'Keep awake')
  setInhibited(cookie !== 0)
}

export const idle = {
  inhibited,
  toggle,
} as const
