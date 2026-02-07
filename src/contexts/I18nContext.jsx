import { createContext, useContext, useState, useCallback } from 'react'
import { detectLocale, translate, AVAILABLE_LOCALES, DEFAULT_LOCALE } from '../lib/i18n'

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale)

  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale)
    localStorage.setItem('sete-ecos-locale', newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const t = useCallback((key, params) => {
    return translate(locale, key, params)
  }, [locale])

  return (
    <I18nContext.Provider value={{
      locale,
      setLocale,
      t,
      availableLocales: AVAILABLE_LOCALES,
      defaultLocale: DEFAULT_LOCALE,
    }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n deve ser usado dentro de I18nProvider')
  }
  return context
}

export default I18nContext
