import '@/infraestructure/polyfill'
import app from 'ags/gtk4/app'
import style from './style.scss'

import { Bar } from '@/app/modules'
import { runtime, shutdown } from '@/infraestructure/runtime'

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
    if (cmd === 'quit') {
      res('bye')
      return shutdown(() => app.quit())
    }
    res(`unknown request: ${argv.join(' ')}`)
  },
  main() {
    app.get_monitors().map(Bar)
  },
})
