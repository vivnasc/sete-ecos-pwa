import { useI18n } from '../contexts/I18nContext'

const LANGUAGE_LABELS = {
  pt: 'PT',
  en: 'EN',
  fr: 'FR'
}

/**
 * LanguageSelector — botão compacto para trocar idioma
 * Mobile-first: pills pequenas tipo [PT] [EN] [FR]
 *
 * @param {string} variant - 'pills' (default) ou 'dropdown'
 * @param {string} size - 'sm' (default) ou 'md'
 */
export default function LanguageSelector({ variant = 'pills', size = 'sm' }) {
  const { locale, setLocale, availableLocales } = useI18n()

  if (variant === 'dropdown') {
    return (
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        aria-label="Language"
        className={`rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 ${
          size === 'sm' ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-2'
        }`}
      >
        {availableLocales.map(lang => (
          <option key={lang} value={lang}>{LANGUAGE_LABELS[lang] || lang.toUpperCase()}</option>
        ))}
      </select>
    )
  }

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Language">
      {availableLocales.map(lang => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          role="radio"
          aria-checked={locale === lang}
          aria-label={lang === 'pt' ? 'Português' : lang === 'en' ? 'English' : 'Français'}
          className={`rounded-full font-semibold transition-all duration-200 active:scale-95 ${
            size === 'sm'
              ? 'text-[10px] px-2.5 py-1 min-w-[32px]'
              : 'text-xs px-3 py-1.5 min-w-[38px]'
          } ${
            locale === lang
              ? 'bg-[#C9A227] text-white shadow-sm'
              : 'bg-white/60 text-gray-500 hover:bg-white/80 border border-gray-200/50'
          }`}
        >
          {LANGUAGE_LABELS[lang] || lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
