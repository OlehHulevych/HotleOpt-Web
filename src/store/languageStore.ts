import { create } from 'zustand'

export type SupportedLanguage = 'EN-GB' | 'UK' | 'PL' | 'DE' | 'CS' | 'RO'

export const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'EN-GB', label: 'English' },
  { code: 'UK',    label: 'Українська' },
  { code: 'PL',    label: 'Polski' },
  { code: 'DE',    label: 'Deutsch' },
  { code: 'CS',    label: 'Čeština' },
  { code: 'RO',    label: 'Română' },
]

type LanguageStore = {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: (localStorage.getItem('language') as SupportedLanguage) ?? 'EN-GB',
  setLanguage: (language) => {
    localStorage.setItem('language', language)
    set({ language })
  },
}))
