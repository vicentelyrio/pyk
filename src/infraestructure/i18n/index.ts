import { createState, type Accessor } from 'gnim'
import type { Locales, TranslationFunctions } from './i18n-types'
import { baseLocale, i18nObject, isLocale } from './i18n-util'
import { loadAllLocales } from './i18n-util.sync'

loadAllLocales()

export const [locale, setLocale] = createState<Locales>(baseLocale)

export const LL: Accessor<TranslationFunctions> = locale((l) => i18nObject(l))

export { isLocale }
export type { Locales, TranslationFunctions }
