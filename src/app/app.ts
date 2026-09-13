import '@/infrastructure/polyfill'
import app from 'ags/gtk4/app'
import style from './style.scss'

import { applyAppearance } from '@/app/appearance'
import { launcher } from '@/app/features'
import { Bar, LauncherWindow, NotificationToasts } from '@/app/modules'
import { runtime } from '@/infrastructure/runtime'

app.connect('shutdown', () => {
  runtime.dispose().catch(() => {})
})

app.start({
  icons: `${SRC}/icons`,
  instanceName: 'pyk',
  css: style,
  requestHandler(argv, res) {
    const [cmd, arg] = argv
    if (cmd === 'css' && arg) {
      app.apply_css(arg, true)
      return res('css applied')
    }
    if (cmd === 'launcher') {
      launcher.toggle()
      return res('launcher toggled')
    }
    res(`unknown request: ${argv.join(' ')}`)
  },
  main() {
    applyAppearance()
    app.get_monitors().map(Bar)
    NotificationToasts()
    LauncherWindow()
  },
})
