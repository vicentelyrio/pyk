import type { BaseTranslation } from '../i18n-types'

const en = {
  WELCOME: 'Welcome to AGS!',
  WORKSPACE_COUNT: '{count:number} workspace{{s}}',

  wifi: {
    title: 'Wi-Fi',
    back: 'Back to Control center',
    radio: 'Wi-Fi radio',
    on: 'on',
    off: 'off',
    offTitle: 'Wi-Fi is off',
    offHint: 'Turn the radio on to see networks',
    connected: 'CONNECTED',
    disconnect: 'Disconnect',
    available: 'AVAILABLE NETWORKS',
    scanning: 'scanning…',
    scan: 'scan',
    emptyTitle: 'No networks found',
    emptyHint: 'Move closer to an access point',
    saved: 'saved',
    password: 'Password',
    showPassword: 'Show password',
    connect: 'Connect',
    connecting: 'Connecting…',
    wrongPassword: 'Wrong password. The network rejected the key.',
  },

  bluetooth: {
    title: 'Bluetooth',
    back: 'Back to Control center',
    radio: 'Bluetooth power',
    on: 'on',
    off: 'off',
    noAdapter: 'no adapter',
    noAdapterTitle: 'No Bluetooth adapter',
    noAdapterHint: 'bluetoothd reports no controller',
    offTitle: 'Bluetooth is off',
    offHint: 'Paired devices will reconnect when on',
    paired: 'PAIRED DEVICES',
    noPairedTitle: 'No paired devices',
    noPairedHint: 'Scan below to find one nearby',
    available: 'AVAILABLE DEVICES',
    scan: 'Scan',
    stopScan: 'Stop scanning',
    idleTitle: 'Not scanning',
    idleHint: 'Start a scan to discover nearby devices',
    scanningTitle: 'Scanning…',
    scanningHint: 'Looking for nearby devices',
    statusConnected: 'Connected',
    statusDisconnected: 'Not connected',
    statusConnecting: 'Connecting…',
    pair: 'Pair',
    pairing: 'Pairing…',
    remove: 'Remove device',
    confirmRemove: 'Click again to remove',
    connectFailed: 'Connection failed — the device did not respond.',
    retry: 'Retry',
  },

  widgets: {
    allDay: 'all day',
    summary: '{condition:string} · {place:string}',
    range: '{low:string} / {high:string} · feels {apparent:string}',
    meters: {
      cpu: 'CPU',
      mem: 'MEM',
      net: 'NET',
      temp: 'TEMP',
    },
    conditions: {
      clear: 'Clear',
      partly: 'Partly cloudy',
      cloudy: 'Cloudy',
      fog: 'Fog',
      drizzle: 'Drizzle',
      rain: 'Rain',
      lightRain: 'Light rain',
      heavyRain: 'Heavy rain',
      snow: 'Snow',
      lightSnow: 'Light snow',
      heavySnow: 'Heavy snow',
      storm: 'Thunderstorm',
    },
  },

  settings: {
    title: 'PYK SETTINGS',
    search: 'Search settings',
    resultsFor: 'Results for “{query:string}”',
    settingCount: '{count:number} setting{{s}}',
    matchCount: '{shown:number} of {total:number}',
    noResultsTitle: 'No settings match',
    noResultsHint: 'Search runs over labels, hints and key combos',
    resetAll: 'Reset all to defaults',
    resetAllArmed: 'Click again to reset everything',
    resetRow: 'Reset to default',
    afterRestart: 'AFTER RESTART',
    restartOne: '1 change applies after restart',
    restartMany: '{count:number} changes apply after restart',
    restartShell: 'Restart shell',
    advancedNote: 'Protocol timeouts and logging. Defaults are correct for almost every setup; every value here applies only after a restart.',
    outOfRange: '{raw:string} is outside {min:string}–{max:string} — value not applied',
    browse: 'Browse…',
    addShortcut: 'Add',
    capturing: 'press keys…',
    captureHint: 'esc cancels',
    removeShortcut: 'Remove',
    recordKey: 'MONITOR',
    recordValue: 'VALUE',
    recordEmpty: 'No per-display overrides — set one from the wallpaper picker',
    clearRecord: 'Clear mapping',
    listEmpty: 'Nothing added yet',
    listAdd: 'Add',
    listPlaceholder: 'https://…',
    listInvalid: '{raw:string} is not a valid entry',
    close: 'Close',

    sections: {
      appearance: 'Appearance',
      scale: 'Scale',
      notifications: 'Notifications',
      bar: 'Bar & popovers',
      launcher: 'Launcher',
      clock: 'Clock & calendar',
      wallpaper: 'Wallpaper',
      widgets: 'Widgets',
      shortcuts: 'Shortcuts',
      media: 'Media',
      advanced: 'Advanced',
    },

    density: {
      label: 'Density',
      hint: 'Sets base font size and spacing grid together',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      custom: 'Custom',
    },

    appearance: {
      accent: {
        label: 'Accent color',
        hint: 'Fixed hue — never sampled from the wallpaper',
      },
      surfaceOpacity: {
        label: 'Surface opacity',
        hint: 'Background alpha of every popout and window',
      },
      fontFamily: {
        label: 'UI font',
        hint: 'Family resolved through fontconfig',
      },
      fontFamilyMono: {
        label: 'Monospace font',
        hint: 'Every number, path and key combo',
      },
      fontSize: {
        label: 'Base font size',
        hint: 'All other sizes derive from this',
      },
      typeScale: {
        label: 'Type scale',
        hint: 'Ratio between consecutive type steps',
      },
      sizeBase: {
        label: 'Size base',
        hint: 'Spacing grid unit — gaps are multiples of it',
      },
      radiusBase: {
        label: 'Corner radius base',
        hint: 'Rows ×2, tiles ×3, panels ×4',
      },
    },

    notifications: {
      toastTimeout: {
        label: 'Toast timeout',
        hint: 'How long a toast stays on screen',
      },
      toastMaxAge: {
        label: 'Show toasts for notifications newer than',
        hint: 'Older notifications go straight to the center',
      },
      criticalSticky: {
        label: 'Critical notifications stay until dismissed',
        hint: 'Urgency 2 ignores the timeout',
      },
    },

    osd: {
      timeout: {
        label: 'Overlay timeout',
        hint: 'How long the volume and brightness overlay stays on screen',
      },
      settleDelay: {
        label: 'Overlay settle delay',
        hint: 'Suppresses the overlay while the shell starts up',
      },
    },

    popover: {
      hoverCloseDelay: {
        label: 'Hover close delay',
        hint: 'Grace period before a hover-opened popover closes',
      },
    },

    launcher: {
      resultLimit: {
        label: 'Result limit',
        hint: 'Caps the panel height',
      },
      closeOnLaunch: {
        label: 'Close after launching',
        hint: 'Also clears the query',
      },
    },

    clock: {
      hourFormat: {
        label: 'Hour format',
        hint: 'Bar clock and lock screen',
      },
      showSeconds: {
        label: 'Show seconds',
        hint: 'Repaints the clock every second',
      },
      showDate: {
        label: 'Show date',
        hint: 'Next to the time in the bar',
      },
      dateFormat: {
        label: 'Date format',
        hint: 'strftime tokens',
      },
    },

    calendar: {
      weekStart: {
        label: 'Week starts on',
        hint: 'Calendar grid and week numbers',
      },
      showWeekNumber: {
        label: 'Show week number',
        hint: 'ISO week, top right of the calendar',
      },
    },

    schedule: {
      directory: {
        label: 'Calendar folder',
        hint: 'Read-only. vdirsyncer syncs remote calendars into this folder',
      },
    },

    wallpaper: {
      directory: {
        label: 'Folder',
        hint: 'Scanned once at startup and on inotify',
      },
      image: {
        label: 'Default image for all displays',
        hint: 'Used by any display without its own mapping',
      },
      urls: {
        label: 'Image URLs',
        hint: 'Downloaded once and shown in the wallpaper picker. Unsplash photo pages work too',
      },
      outputs: {
        label: 'Per-display wallpaper',
        hint: 'Overrides the default for one output',
      },
      fit: {
        label: 'Fit',
        hint: 'How an image fills a display',
      },
    },

    shortcuts: {
      niriBinds: {
        label: 'Write niri keybinds',
        hint: 'Emits pyk-binds.kdl — include it from your niri config',
      },
      global: {
        launcher: {
          label: 'Global — Toggle launcher',
          hint: 'Opens and closes the launcher from anywhere',
        },
      },
      launcher: {
        close: {
          label: 'Launcher — Close',
          hint: 'Dismisses the launcher without running anything',
        },
        next: {
          label: 'Launcher — Next',
          hint: 'Moves down the result list',
        },
        previous: {
          label: 'Launcher — Previous',
          hint: 'Moves up the result list',
        },
        launch: {
          label: 'Launcher — Launch',
          hint: 'Runs the selected result',
        },
      },
    },

    widgets: {
      layout: {
        label: 'Layout',
        hint: 'Which desktop widgets show on each side, top to bottom',
        allDisplays: 'All displays',
        inherited: 'Uses the layout for all displays — any change makes it specific to this display',
        custom: 'This display has its own layout',
        useDefault: 'Use all-displays layout',
        start: 'LEFT',
        end: 'RIGHT',
        up: 'Move up',
        down: 'Move down',
        toStart: 'Move to the left side',
        toEnd: 'Move to the right side',
        remove: 'Remove',
        empty: 'No widgets on this side',
        items: {
          today: 'Date & events',
          todos: 'Todos',
          player: 'Player',
          weather: 'Weather',
          meters: 'System meters',
        },
      },
    },

    weather: {
      location: {
        label: 'Weather location',
        hint: 'City name, geocoded by Open-Meteo',
      },
      units: {
        label: 'Units',
        hint: 'metric is °C, imperial is °F',
      },
      refreshInterval: {
        label: 'Weather refresh interval',
        hint: 'How often the forecast is fetched',
      },
    },

    todos: {
      file: {
        label: 'Todo file',
        hint: 'todo.txt format — lines starting with “x ” are done',
      },
    },

    monitor: {
      interval: {
        label: 'Meter sample interval',
        hint: 'CPU, memory, network and temperature',
      },
    },

    media: {
      progressInterval: {
        label: 'Progress refresh interval',
        hint: 'MPRIS position polling',
      },
      channels: {
        label: 'Channels',
        hint: 'Names a player by site or app, and fills in cover art from a URL template when the player sends none',
      },
      localCovers: {
        label: 'Local cover files',
        hint: 'Looked up next to local media that has no embedded art',
      },
    },

    system: {
      reconnectDelay: {
        label: 'Reconnect delay',
        hint: 'First retry after a D-Bus drop',
      },
      reconnectMaxDelay: {
        label: 'Max reconnect delay',
        hint: 'Backoff ceiling',
      },
      actionTimeout: {
        label: 'Action timeout',
        hint: 'Any single D-Bus call',
      },
      bluetoothConnectTimeout: {
        label: 'Bluetooth connect timeout',
        hint: 'Per connect attempt',
      },
      logFormat: {
        label: 'Log format',
        hint: 'journal is structured, pretty is human',
      },
      logLevel: {
        label: 'Log level',
        hint: 'Anything below Info is noisy',
      },
    },
  },
} satisfies BaseTranslation

export default en
