import { createState } from 'ags'
import type { SectionId } from '@/app/features'

const [open, setOpen] = createState(false)
const [section, setSection] = createState<SectionId>('appearance')

export const settings = {
  open,
  section,
  select: setSection,
  show: (at?: SectionId) => {
    if (at) setSection(at)
    setOpen(true)
  },
  hide: () => setOpen(false),
  toggle: () => setOpen((it) => !it),
} as const
