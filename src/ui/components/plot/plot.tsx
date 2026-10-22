import type cairo from 'cairo'
import Cairo from 'gi://cairo?version=1.0'
import { Gtk } from 'ags/gtk4'
import { onCleanup, type Accessor } from 'ags'
import { clsx } from 'clsx'

const STROKE = 1.5
const DOT = 3.5

export type PlotProps = {
  readonly values: Accessor<readonly number[]>
  readonly mark?: 'line' | 'dots'
  readonly only?: Accessor<readonly boolean[]>
  readonly anchors?: (area: Gtk.Widget) => readonly number[]
  readonly capacity?: number
  readonly className?: string
}

export function Plot({ values, mark = 'line', only, anchors, capacity, className }: PlotProps) {
  const inset = mark === 'dots' ? DOT : STROKE

  const x = (at: number, count: number, width: number) => {
    const slots = Math.max((capacity ?? count) - 1, 1)
    const offset = (capacity ?? count) - count
    return inset + ((offset + at) / slots) * (width - inset * 2)
  }

  const y = (value: number, height: number) =>
    inset + (1 - Math.min(Math.max(value, 0), 1)) * (height - inset * 2)

  const draw = (area: Gtk.DrawingArea, cr: cairo.Context, width: number, height: number) => {
    const points = values.peek()
    const shown = only?.peek()
    const color = area.get_color()
    const placed = anchors?.(area)
    const across = (index: number) => placed?.[index] ?? x(index, points.length, width)

    cr.setSourceRGBA(color.red, color.green, color.blue, color.alpha)

    if (mark === 'dots') {
      points.forEach((value, index) => {
        if (shown && !shown[index]) return
        cr.arc(across(index), y(value, height), DOT, 0, Math.PI * 2)
        cr.fill()
      })
    }
    else if (points.length > 1) {
      cr.setLineWidth(STROKE)
      cr.setLineCap(Cairo.LineCap.ROUND)
      cr.setLineJoin(Cairo.LineJoin.ROUND)
      points.forEach((value, index) => cr.lineTo(across(index), y(value, height)))
      cr.stroke()
    }

  }

  return (
    <drawingarea
      class={clsx('plot', className)}
      hexpand
      $={(self: Gtk.DrawingArea) => {
        self.set_draw_func(draw)
        const redraw = () => self.queue_draw()
        onCleanup(values.subscribe(redraw))
        if (only) onCleanup(only.subscribe(redraw))
      }}
    />
  )
}
