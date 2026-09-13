import { choice, color, defaults, number, path, record, shortcut, text, toggle, type Patch, type Value } from './spec'

export const configSpec = {
  appearance: {
    accent: color('#c9a7f0'),
    surfaceOpacity: number(0.9, { min: 0, max: 1 }),
    fontFamily: text('IBM Plex Sans'),
    fontFamilyMono: text('IBM Plex Mono'),
    fontSize: number(16, { min: 8, max: 32, unit: 'px' }),
    typeScale: number(1.2, { min: 1, max: 2 }),
    sizeBase: number(4, { min: 2, max: 8, unit: 'px' }),
    radiusBase: number(4, { min: 0, max: 12, unit: 'px' }),
  },
  notifications: {
    toastTimeout: number(3200, { min: 500, max: 60_000, unit: 'ms' }),
    toastMaxAge: number(10_000, { min: 0, max: 600_000, unit: 'ms' }),
    criticalSticky: toggle(true),
  },
  popover: {
    hoverCloseDelay: number(220, { min: 0, max: 2000, unit: 'ms' }),
  },
  launcher: {
    resultLimit: number(8, { min: 1, max: 20 }),
    closeOnLaunch: toggle(true),
  },
  clock: {
    hourFormat: choice(['24h', '12h'], '24h'),
    showSeconds: toggle(false),
    showDate: toggle(true),
    dateFormat: text('%a %-d %b'),
  },
  calendar: {
    weekStart: choice(['monday', 'sunday'], 'monday'),
    showWeekNumber: toggle(true),
  },
  schedule: {
    directory: path('~/.local/share/calendars'),
  },
  wallpaper: {
    directory: path('~/Pictures/Wallpapers'),
    image: path(''),
    outputs: record(),
    fit: choice(['cover', 'contain', 'fill'], 'cover'),
  },
  shortcuts: {
    niriBinds: toggle(true),
    global: {
      launcher: shortcut(['Mod+Space']),
    },
    launcher: {
      close: shortcut(['Escape']),
      next: shortcut(['Down', 'Tab', 'Ctrl+J']),
      previous: shortcut(['Up', 'Shift+Tab', 'Ctrl+K']),
      launch: shortcut(['Return', 'KP_Enter']),
    },
  },
  media: {
    progressInterval: number(1000, { min: 100, max: 10_000, unit: 'ms', apply: 'restart' }),
  },
  system: {
    reconnectDelay: number(500, { min: 100, max: 60_000, unit: 'ms', apply: 'restart' }),
    reconnectMaxDelay: number(5000, { min: 100, max: 300_000, unit: 'ms', apply: 'restart' }),
    actionTimeout: number(3000, { min: 100, max: 60_000, unit: 'ms', apply: 'restart' }),
    bluetoothConnectTimeout: number(15_000, { min: 1000, max: 120_000, unit: 'ms', apply: 'restart' }),
    logFormat: choice(['journal', 'pretty'], 'journal', { apply: 'restart' }),
    logLevel: choice(['Fatal', 'Error', 'Warn', 'Info', 'Debug', 'Trace'], 'Info', { apply: 'restart' }),
  },
} as const

export type Config = Value<typeof configSpec>
export type ConfigPatch = Patch<Config>

export type AppearanceConfig = Config['appearance']
export type NotificationsConfig = Config['notifications']
export type PopoverConfig = Config['popover']
export type LauncherConfig = Config['launcher']
export type ShortcutsConfig = Config['shortcuts']
export type WallpaperConfig = Config['wallpaper']
export type ClockConfig = Config['clock']
export type CalendarConfig = Config['calendar']
export type ScheduleConfig = Config['schedule']
export type MediaConfig = Config['media']
export type SystemConfig = Config['system']

export const defaultConfig: Config = defaults(configSpec)
