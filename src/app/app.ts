import '@/infrastructure/polyfill'
import app from 'ags/gtk4/app'
import style from './style.scss'

import { applyAppearance } from '@/app/appearance'
import {
  Bar,
  brightnessKeys,
  launcher,
  LauncherWindow,
  NotificationToasts,
  OsdWindow,
  settings,
  SettingsWindow,
  WallpaperWindow,
  WidgetsWindow
} from '@/app/modules'

import { INSTANCE_NAME } from '@/infrastructure/instance'
import { runtime } from '@/infrastructure/runtime'

app.connect('shutdown', () => {
  runtime.dispose().catch(() => {})
})

app.start({
  icons: `${SRC}/icons`,
  instanceName: INSTANCE_NAME,
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
    if (cmd === 'brightness' && (arg === 'up' || arg === 'down')) {
      brightnessKeys.step(arg)
      return res(`brightness ${arg}`)
    }
    if (cmd === 'settings') {
      settings.toggle()
      return res('settings toggled')
    }
    res(`unknown request: ${argv.join(' ')}`)
  },
  main() {
    applyAppearance()
    app.get_monitors().map(WallpaperWindow)
    app.get_monitors().map(WidgetsWindow)
    app.get_monitors().map(Bar)
    NotificationToasts()
    OsdWindow()
    LauncherWindow()
    SettingsWindow()
  },
})
