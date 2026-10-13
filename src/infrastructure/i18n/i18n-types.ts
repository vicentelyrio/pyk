import type {
  BaseTranslation as BaseTranslationType,
  LocalizedString,
  RequiredParams
} from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'en'

export type Locales = 'en'

type RootTranslation = {
  WELCOME: string
  WORKSPACE_COUNT: RequiredParams<'count'>
  wifi: {
    title: string
    back: string
    radio: string
    on: string
    off: string
    offTitle: string
    offHint: string
    connected: string
    disconnect: string
    available: string
    scanning: string
    scan: string
    emptyTitle: string
    emptyHint: string
    saved: string
    password: string
    showPassword: string
    connect: string
    connecting: string
    wrongPassword: string
  }
  bluetooth: {
    title: string
    back: string
    radio: string
    on: string
    off: string
    noAdapter: string
    noAdapterTitle: string
    noAdapterHint: string
    offTitle: string
    offHint: string
    paired: string
    noPairedTitle: string
    noPairedHint: string
    available: string
    scan: string
    stopScan: string
    idleTitle: string
    idleHint: string
    scanningTitle: string
    scanningHint: string
    statusConnected: string
    statusDisconnected: string
    statusConnecting: string
    pair: string
    pairing: string
    remove: string
    confirmRemove: string
    connectFailed: string
    retry: string
  }
  widgets: {
    allDay: string
    summary: RequiredParams<'condition' | 'place'>
    range: RequiredParams<'apparent' | 'high' | 'low'>
    meters: {
      cpu: string
      mem: string
      net: string
      temp: string
    }
    conditions: {
      clear: string
      partly: string
      cloudy: string
      fog: string
      drizzle: string
      rain: string
      lightRain: string
      heavyRain: string
      snow: string
      lightSnow: string
      heavySnow: string
      storm: string
    }
  }
  settings: {
    title: string
    search: string
    resultsFor: RequiredParams<'query'>
    settingCount: RequiredParams<'count'>
    matchCount: RequiredParams<'shown' | 'total'>
    noResultsTitle: string
    noResultsHint: string
    resetAll: string
    resetAllArmed: string
    resetRow: string
    afterRestart: string
    restartOne: string
    restartMany: RequiredParams<'count'>
    restartShell: string
    advancedNote: string
    outOfRange: RequiredParams<'max' | 'min' | 'raw'>
    browse: string
    addShortcut: string
    capturing: string
    captureHint: string
    removeShortcut: string
    recordKey: string
    recordValue: string
    recordEmpty: string
    clearRecord: string
    listEmpty: string
    listAdd: string
    listPlaceholder: string
    listInvalid: RequiredParams<'raw'>
    close: string
    sections: {
      appearance: string
      scale: string
      notifications: string
      bar: string
      launcher: string
      clock: string
      wallpaper: string
      widgets: string
      shortcuts: string
      media: string
      advanced: string
    }
    density: {
      label: string
      hint: string
      small: string
      medium: string
      large: string
      custom: string
    }
    appearance: {
      accent: {
        label: string
        hint: string
      }
      surfaceOpacity: {
        label: string
        hint: string
      }
      fontFamily: {
        label: string
        hint: string
      }
      fontFamilyMono: {
        label: string
        hint: string
      }
      fontSize: {
        label: string
        hint: string
      }
      typeScale: {
        label: string
        hint: string
      }
      sizeBase: {
        label: string
        hint: string
      }
      radiusBase: {
        label: string
        hint: string
      }
    }
    notifications: {
      toastTimeout: {
        label: string
        hint: string
      }
      toastMaxAge: {
        label: string
        hint: string
      }
      criticalSticky: {
        label: string
        hint: string
      }
    }
    osd: {
      timeout: {
        label: string
        hint: string
      }
      settleDelay: {
        label: string
        hint: string
      }
    }
    popover: {
      hoverCloseDelay: {
        label: string
        hint: string
      }
    }
    launcher: {
      resultLimit: {
        label: string
        hint: string
      }
      closeOnLaunch: {
        label: string
        hint: string
      }
    }
    clock: {
      hourFormat: {
        label: string
        hint: string
      }
      showSeconds: {
        label: string
        hint: string
      }
      showDate: {
        label: string
        hint: string
      }
      dateFormat: {
        label: string
        hint: string
      }
    }
    calendar: {
      weekStart: {
        label: string
        hint: string
      }
      showWeekNumber: {
        label: string
        hint: string
      }
    }
    schedule: {
      directory: {
        label: string
        hint: string
      }
    }
    wallpaper: {
      directory: {
        label: string
        hint: string
      }
      image: {
        label: string
        hint: string
      }
      urls: {
        label: string
        hint: string
      }
      outputs: {
        label: string
        hint: string
      }
      fit: {
        label: string
        hint: string
      }
    }
    shortcuts: {
      niriBinds: {
        label: string
        hint: string
      }
      global: {
        launcher: {
          label: string
          hint: string
        }
      }
      launcher: {
        close: {
          label: string
          hint: string
        }
        next: {
          label: string
          hint: string
        }
        previous: {
          label: string
          hint: string
        }
        launch: {
          label: string
          hint: string
        }
      }
    }
    weather: {
      location: {
        label: string
        hint: string
      }
      units: {
        label: string
        hint: string
      }
      refreshInterval: {
        label: string
        hint: string
      }
    }
    todos: {
      file: {
        label: string
        hint: string
      }
    }
    monitor: {
      interval: {
        label: string
        hint: string
      }
    }
    media: {
      progressInterval: {
        label: string
        hint: string
      }
      channels: {
        label: string
        hint: string
      }
      localCovers: {
        label: string
        hint: string
      }
    }
    system: {
      reconnectDelay: {
        label: string
        hint: string
      }
      reconnectMaxDelay: {
        label: string
        hint: string
      }
      actionTimeout: {
        label: string
        hint: string
      }
      bluetoothConnectTimeout: {
        label: string
        hint: string
      }
      logFormat: {
        label: string
        hint: string
      }
      logLevel: {
        label: string
        hint: string
      }
    }
  }
}

export type Translation = RootTranslation

export type Translations = RootTranslation

export type TranslationFunctions = {
  WELCOME: () => LocalizedString
  WORKSPACE_COUNT: (arg: { count: number }) => LocalizedString
  wifi: {
    title: () => LocalizedString
    back: () => LocalizedString
    radio: () => LocalizedString
    on: () => LocalizedString
    off: () => LocalizedString
    offTitle: () => LocalizedString
    offHint: () => LocalizedString
    connected: () => LocalizedString
    disconnect: () => LocalizedString
    available: () => LocalizedString
    scanning: () => LocalizedString
    scan: () => LocalizedString
    emptyTitle: () => LocalizedString
    emptyHint: () => LocalizedString
    saved: () => LocalizedString
    password: () => LocalizedString
    showPassword: () => LocalizedString
    connect: () => LocalizedString
    connecting: () => LocalizedString
    wrongPassword: () => LocalizedString
  }
  bluetooth: {
    title: () => LocalizedString
    back: () => LocalizedString
    radio: () => LocalizedString
    on: () => LocalizedString
    off: () => LocalizedString
    noAdapter: () => LocalizedString
    noAdapterTitle: () => LocalizedString
    noAdapterHint: () => LocalizedString
    offTitle: () => LocalizedString
    offHint: () => LocalizedString
    paired: () => LocalizedString
    noPairedTitle: () => LocalizedString
    noPairedHint: () => LocalizedString
    available: () => LocalizedString
    scan: () => LocalizedString
    stopScan: () => LocalizedString
    idleTitle: () => LocalizedString
    idleHint: () => LocalizedString
    scanningTitle: () => LocalizedString
    scanningHint: () => LocalizedString
    statusConnected: () => LocalizedString
    statusDisconnected: () => LocalizedString
    statusConnecting: () => LocalizedString
    pair: () => LocalizedString
    pairing: () => LocalizedString
    remove: () => LocalizedString
    confirmRemove: () => LocalizedString
    connectFailed: () => LocalizedString
    retry: () => LocalizedString
  }
  widgets: {
    allDay: () => LocalizedString
    summary: (arg: { condition: string, place: string }) => LocalizedString
    range: (arg: { apparent: string, high: string, low: string }) => LocalizedString
    meters: {
      cpu: () => LocalizedString
      mem: () => LocalizedString
      net: () => LocalizedString
      temp: () => LocalizedString
    }
    conditions: {
      clear: () => LocalizedString
      partly: () => LocalizedString
      cloudy: () => LocalizedString
      fog: () => LocalizedString
      drizzle: () => LocalizedString
      rain: () => LocalizedString
      lightRain: () => LocalizedString
      heavyRain: () => LocalizedString
      snow: () => LocalizedString
      lightSnow: () => LocalizedString
      heavySnow: () => LocalizedString
      storm: () => LocalizedString
    }
  }
  settings: {
    title: () => LocalizedString
    search: () => LocalizedString
    resultsFor: (arg: { query: string }) => LocalizedString
    settingCount: (arg: { count: number }) => LocalizedString
    matchCount: (arg: { shown: number, total: number }) => LocalizedString
    noResultsTitle: () => LocalizedString
    noResultsHint: () => LocalizedString
    resetAll: () => LocalizedString
    resetAllArmed: () => LocalizedString
    resetRow: () => LocalizedString
    afterRestart: () => LocalizedString
    restartOne: () => LocalizedString
    restartMany: (arg: { count: number }) => LocalizedString
    restartShell: () => LocalizedString
    advancedNote: () => LocalizedString
    outOfRange: (arg: { max: string, min: string, raw: string }) => LocalizedString
    browse: () => LocalizedString
    addShortcut: () => LocalizedString
    capturing: () => LocalizedString
    captureHint: () => LocalizedString
    removeShortcut: () => LocalizedString
    recordKey: () => LocalizedString
    recordValue: () => LocalizedString
    recordEmpty: () => LocalizedString
    clearRecord: () => LocalizedString
    listEmpty: () => LocalizedString
    listAdd: () => LocalizedString
    listPlaceholder: () => LocalizedString
    listInvalid: (arg: { raw: string }) => LocalizedString
    close: () => LocalizedString
    sections: {
      appearance: () => LocalizedString
      scale: () => LocalizedString
      notifications: () => LocalizedString
      bar: () => LocalizedString
      launcher: () => LocalizedString
      clock: () => LocalizedString
      wallpaper: () => LocalizedString
      widgets: () => LocalizedString
      shortcuts: () => LocalizedString
      media: () => LocalizedString
      advanced: () => LocalizedString
    }
    density: {
      label: () => LocalizedString
      hint: () => LocalizedString
      small: () => LocalizedString
      medium: () => LocalizedString
      large: () => LocalizedString
      custom: () => LocalizedString
    }
    appearance: {
      accent: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      surfaceOpacity: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      fontFamily: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      fontFamilyMono: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      fontSize: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      typeScale: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      sizeBase: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      radiusBase: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    notifications: {
      toastTimeout: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      toastMaxAge: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      criticalSticky: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    osd: {
      timeout: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      settleDelay: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    popover: {
      hoverCloseDelay: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    launcher: {
      resultLimit: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      closeOnLaunch: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    clock: {
      hourFormat: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      showSeconds: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      showDate: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      dateFormat: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    calendar: {
      weekStart: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      showWeekNumber: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    schedule: {
      directory: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    wallpaper: {
      directory: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      image: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      urls: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      outputs: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      fit: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    shortcuts: {
      niriBinds: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      global: {
        launcher: {
          label: () => LocalizedString
          hint: () => LocalizedString
        }
      }
      launcher: {
        close: {
          label: () => LocalizedString
          hint: () => LocalizedString
        }
        next: {
          label: () => LocalizedString
          hint: () => LocalizedString
        }
        previous: {
          label: () => LocalizedString
          hint: () => LocalizedString
        }
        launch: {
          label: () => LocalizedString
          hint: () => LocalizedString
        }
      }
    }
    weather: {
      location: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      units: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      refreshInterval: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    todos: {
      file: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    monitor: {
      interval: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    media: {
      progressInterval: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      channels: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      localCovers: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
    system: {
      reconnectDelay: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      reconnectMaxDelay: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      actionTimeout: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      bluetoothConnectTimeout: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      logFormat: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
      logLevel: {
        label: () => LocalizedString
        hint: () => LocalizedString
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Formatters = {}
