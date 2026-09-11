import GLib from 'gi://GLib'
import {
  Cause,
  Config,
  ConfigProvider,
  Layer,
  Logger,
  LogLevel,
  References,
} from 'effect'

const DOMAIN = 'pyk'

function environ(): Record<string, string> {
  const env: Record<string, string> = {}

  for (const entry of GLib.get_environ()) {
    const at = entry.indexOf('=')
    if (at > 0) env[entry.slice(0, at)] = entry.slice(at + 1)
  }

  return env
}

const EnvConfig = ConfigProvider.layer(ConfigProvider.fromEnvRecord(environ()))

function toGLibLevel(level: LogLevel.LogLevel): GLib.LogLevelFlags {
  switch (level) {
    case 'Fatal':
    case 'Error':
      return GLib.LogLevelFlags.LEVEL_CRITICAL
    case 'Warn':
      return GLib.LogLevelFlags.LEVEL_WARNING
    case 'Info':
      return GLib.LogLevelFlags.LEVEL_MESSAGE
    default:
      return GLib.LogLevelFlags.LEVEL_DEBUG
  }
}

function field(key: string): string {
  return `PYK_${key.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value) ?? String(value)
}

const journald = Logger.make<unknown, void>(({ cause, date, fiber, logLevel, message }) => {
  const parts = Array.isArray(message) ? message : [message]

  const fields: Record<string, string> = {
    MESSAGE: parts.map(text).join(' '),
    SYSLOG_IDENTIFIER: DOMAIN,
    PYK_LEVEL: logLevel,
  }

  if (cause.reasons.length > 0) fields.PYK_CAUSE = Cause.pretty(cause)

  for (const [key, value] of Object.entries(fiber.getRef(References.CurrentLogAnnotations))) {
    fields[field(key)] = text(value)
  }

  const spans = fiber.getRef(References.CurrentLogSpans)

  if (spans.length > 0) {
    const now = date.getTime()
    fields.PYK_SPANS = spans.map(([label, at]) => `${label}=${now - at}ms`).join(' ')
  }

  GLib.log_structured(DOMAIN, toGLibLevel(logLevel), fields)
})

const SEVERITIES = ['Fatal', 'Error', 'Warn', 'Info', 'Debug', 'Trace'] as const

const settings = Config.all({
  format: Config.Literals(['journal', 'pretty'], 'PYK_LOG').pipe(Config.withDefault('journal')),
  level: Config.Literals(SEVERITIES, 'PYK_LOG_LEVEL').pipe(Config.withDefault('Info')),
})

const LoggerLive = Layer.unwrap(
  Config.map(settings, ({ format, level }) =>
    Layer.mergeAll(
      Logger.layer([format === 'pretty' ? Logger.consolePrettyTty() : journald]),
      Layer.succeed(References.CurrentLogLevel, level),
    ),
  ),
)

export const Platform = LoggerLive.pipe(Layer.provideMerge([EnvConfig]))
