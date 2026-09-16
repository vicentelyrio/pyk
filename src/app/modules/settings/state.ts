import { createState } from 'ags'

const [open, setOpen] = createState(false)

export const settings = {
  open,
  show: () => setOpen(true),
  hide: () => setOpen(false),
  toggle: () => setOpen((it) => !it),
} as const
