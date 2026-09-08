import type {
  BaseTranslation as BaseTranslationType,
  LocalizedString
} from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'en'

export type Locales = 'en'

type RootTranslation = {
  WELCOME: string
  /**
   * {{count}} workspace{{s}}
   * @param {number} count
   */
  WORKSPACE_COUNT: string
}

export type Translation = RootTranslation

export type Translations = RootTranslation

export type TranslationFunctions = {
  WELCOME: () => LocalizedString
  /**
   * {{count}} workspace{{s}}
   */
  WORKSPACE_COUNT: (arg: { count: number }) => LocalizedString
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Formatters = {}
