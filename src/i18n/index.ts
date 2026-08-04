import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { SupportedLanguage } from '../store/languageStore'

import en from './locales/en.json'
import uk from './locales/uk.json'
import pl from './locales/pl.json'
import de from './locales/de.json'
import cs from './locales/cs.json'
import ro from './locales/ro.json'

export const LANG_MAP: Record<SupportedLanguage, string> = {
  'EN-GB': 'en',
  'UK':    'uk',
  'PL':    'pl',
  'DE':    'de',
  'CS':    'cs',
  'RO':    'ro',
}

const savedLang = localStorage.getItem('language') as SupportedLanguage | null
const initialLng = LANG_MAP[savedLang ?? 'EN-GB'] ?? 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk },
      pl: { translation: pl },
      de: { translation: de },
      cs: { translation: cs },
      ro: { translation: ro },
    },
    lng: initialLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n
