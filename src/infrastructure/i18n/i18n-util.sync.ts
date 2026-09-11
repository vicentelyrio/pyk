import { initFormatters } from './formatters'
import type { Locales, Translations } from './i18n-types'
import { loadedFormatters, loadedLocales } from './i18n-util'

import en from './en'

const localeTranslations: Record<Locales, Translations> = {
  en,
}

export const loadFormatters = (locale: Locales): void => {
  loadedFormatters[locale] = initFormatters(locale)
}

export const loadLocale = (locale: Locales): void => {
  if (loadedLocales[locale]) return

  loadedLocales[locale] = localeTranslations[locale]
  loadFormatters(locale)
}

export const loadAllLocales = (): void => {
  const locales: Locales[] = ['en']
  locales.forEach(loadLocale)
}
