export * from './config'
export type {
  AppearanceConfig,
  ClockConfig,
  Apply,
  Config,
  ConfigPatch,
  LauncherConfig,
  Leaf,
  MediaConfig,
  NotificationsConfig,
  PopoverConfig,
  ShortcutsConfig,
  Spec,
  SystemConfig,
  WallpaperConfig,
} from './schema'
export { collapseHome, configSpec, defaultConfig, expandHome } from './schema'
export { Configuration, StartupConfig } from './store'
