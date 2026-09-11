import {
  i18nObject as initI18nObject,
  i18nString as initI18nString
} from 'typesafe-i18n'

import type {
  Formatters,
  Locales,
  TranslationFunctions,
  Translations
} from './i18n-types'

export const baseLocale: Locales = 'en'

export const locales: Locales[] = ['en']

export const isLocale = (locale: string): locale is Locales => locales.includes(locale as Locales)

export const loadedLocales: Record<Locales, Translations> = {
} as Record<Locales, Translations>

export const loadedFormatters: Record<Locales, Formatters> = {
} as Record<Locales, Formatters>

export const i18nString = (locale: Locales) => initI18nString<Locales, Formatters>(
  locale,
  loadedFormatters[locale]
)

export const i18nObject = (locale: Locales): TranslationFunctions =>
  initI18nObject<Locales, Translations, TranslationFunctions, Formatters>(
    locale,
    loadedLocales[locale],
    loadedFormatters[locale],
  )
