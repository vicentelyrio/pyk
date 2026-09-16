export * from './config'
export type {
  AppearanceConfig,
  CalendarConfig,
  ClockConfig,
  Apply,
  Config,
  ConfigPatch,
  LauncherConfig,
  Leaf,
  PathLeaf,
  NumberLeaf,
  ChoiceLeaf,
  MediaConfig,
  NotificationsConfig,
  PopoverConfig,
  ShortcutsConfig,
  Spec,
  SystemConfig,
  WallpaperConfig,
} from './schema'
export { collapseHome, configSpec, defaultConfig, expandHome, isLeaf } from './schema'
export { Configuration, StartupConfig } from './store'
