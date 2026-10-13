import { Gtk } from 'ags/gtk4'
import { For, createComputed } from 'ags'
import { LL } from '@/infrastructure/i18n'
import { weather, type ForecastSlot, type WeatherCondition } from '@/infrastructure/weather'
import { Plot } from '@/ui/components'
import { alignFor, edgeFirst, type Side } from '@/ui/side'

const cs = {
  root: 'weather',
  now: 'weather-now',
  icon: 'weather-icon',
  temperature: 'weather-temperature',
  summary: 'weather-summary',
  range: 'weather-range',
  forecast: 'forecast',
  chart: 'forecast-chart',
  line: 'forecast-line',
  day: 'forecast-day',
  night: 'forecast-night',
  slot: 'forecast-slot',
  degrees: 'forecast-degrees',
  time: 'forecast-time',
}

const MIN_SPAN = 6

const icons: Readonly<Record<WeatherCondition, readonly [string, string]>> = {
  clear: ['pyk-weather-sun-symbolic', 'pyk-weather-moon-symbolic'],
  partly: ['pyk-weather-cloud-sun-symbolic', 'pyk-weather-cloud-moon-symbolic'],
  cloudy: ['pyk-weather-cloud-symbolic', 'pyk-weather-cloud-symbolic'],
  fog: ['pyk-weather-fog-symbolic', 'pyk-weather-fog-symbolic'],
  drizzle: ['pyk-weather-drizzle-symbolic', 'pyk-weather-drizzle-symbolic'],
  rain: ['pyk-weather-rain-symbolic', 'pyk-weather-rain-symbolic'],
  snow: ['pyk-weather-snow-symbolic', 'pyk-weather-snow-symbolic'],
  storm: ['pyk-weather-storm-symbolic', 'pyk-weather-storm-symbolic'],
}

export function Weather({ side }: { readonly side: Side }) {
  const icon = createComputed(() => icons[weather.condition()][weather.isDay() ? 0 : 1])
  const summary = createComputed(() =>
    LL().widgets.summary({ condition: LL().widgets.conditions[weather.label()](), place: weather.place() }))
  const range = createComputed(() =>
    LL().widgets.range({ low: weather.low(), high: weather.high(), apparent: weather.apparent() }))

  return (
    <box class={cs.root} orientation={Gtk.Orientation.VERTICAL} visible={weather.isAvailable}>
      <box class={cs.now} halign={alignFor(side)}>
        {edgeFirst(
          side,
          <label class={cs.temperature} label={weather.temperature} />,
          <image class={cs.icon} iconName={icon} valign={Gtk.Align.START} />,
        )}
      </box>
      <label class={cs.summary} label={summary} xalign={side === 'start' ? 0 : 1} />
      <label class={cs.range} label={range} xalign={side === 'start' ? 0 : 1} />
      <Forecast />
    </box>
  )
}

function normalize(values: readonly number[]): readonly number[] {
  const low = Math.min(...values)
  const high = Math.max(...values)
  const span = Math.max(high - low, MIN_SPAN)
  const floor = (high + low - span) / 2
  return values.map((it) => (it - floor) / span)
}

function Forecast() {
  const slots = weather.forecast
  const values = createComputed(() => normalize(slots().map((it) => it.value)))
  const day = createComputed(() => slots().map((it) => it.isDay))
  const night = createComputed(() => slots().map((it) => !it.isDay))

  return (
    <box class={cs.forecast} orientation={Gtk.Orientation.VERTICAL} visible={slots.as((it) => it.length > 0)}>
      <overlay class={cs.chart}>
        <Plot className={cs.line} values={values} spread="columns" />
        <box $type="overlay">
          <Plot className={cs.day} values={values} mark="dots" only={day} spread="columns" />
        </box>
        <box $type="overlay">
          <Plot className={cs.night} values={values} mark="dots" only={night} spread="columns" />
        </box>
      </overlay>
      <box homogeneous>
        <For each={slots}>
          {(slot: ForecastSlot) => (
            <box class={cs.slot} orientation={Gtk.Orientation.VERTICAL}>
              <label class={cs.degrees} label={slot.temperature} />
              <label class={cs.time} label={slot.time} />
            </box>
          )}
        </For>
      </box>
    </box>
  )
}
