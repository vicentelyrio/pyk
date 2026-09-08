import '@/infraestructure/polyfill'
import { Effect } from 'effect'
import app from 'ags/gtk4/app'
import style from './style.scss'
import Bar from './widget/Bar'

console.log(Effect.runSync(Effect.succeed("effect ok")))

app.start({
  css: style,
  main() {
    app.get_monitors().map(Bar)
  },
})
