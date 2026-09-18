import app from 'ags/gtk4/app'
import { Astal } from 'ags/gtk4'
import { onCleanup } from 'ags'
import { Osd } from '@/app/features'

import { osd } from './state'

const cs = {
  root: 'osd',
}

export const OSD_WINDOW = 'osd'

export function OsdWindow() {
  const { RIGHT } = Astal.WindowAnchor

  return (
    <window
      name={OSD_WINDOW}
      class={cs.root}
      visible={osd.visible}
      resizable={false}
      anchor={RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.NONE}
      application={app}
      $={() => onCleanup(osd.watch())}>
      <Osd feedback={osd.feedback} />
    </window>
  )
}
