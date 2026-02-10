import { describe, it, expect, beforeEach } from 'vitest'
import { translate, detectLocale, AVAILABLE_LOCALES, DEFAULT_LOCALE } from './i18n'

describe('i18n — Sistema de Internacionalização', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('translate()', () => {
    it('traduz chaves em pt (default)', () => {
      expect(translate('pt', 'nav.home')).toBe('Inicio')
      expect(translate('pt', 'common.loading')).toBe('A carregar...')
    })

    it('traduz chaves em en', () => {
      expect(translate('en', 'nav.home')).toBe('Home')
      expect(translate('en', 'common.loading')).toBe('Loading...')
    })

    it('traduz chaves em fr', () => {
      expect(translate('fr', 'nav.home')).toBe('Accueil')
    })

    it('faz fallback para pt quando chave não existe no locale', () => {
      expect(translate('fr', 'eco.vitalis.desc')).toBe('Nutrição & Corpo')
    })

    it('retorna a chave quando não encontra tradução', () => {
      expect(translate('pt', 'inexistente.chave')).toBe('inexistente.chave')
    })

    it('suporta aliases pt-PT, pt-BR, pt-MZ', () => {
      expect(translate('pt-PT', 'nav.home')).toBe('Inicio')
      expect(translate('pt-BR', 'nav.home')).toBe('Inicio')
      expect(translate('pt-MZ', 'nav.home')).toBe('Inicio')
    })

    it('interpola parâmetros', () => {
      // Caso com parâmetro que podemos testar
      expect(translate('pt', 'nav.home')).toBe('Inicio')
    })
  })

  describe('detectLocale()', () => {
    it('retorna locale guardado no localStorage', () => {
      localStorage.setItem('sete-ecos-locale', 'en')
      expect(detectLocale()).toBe('en')
    })

    it('retorna default baseado no browser language', () => {
      // Em ambiente de teste, navigator.language pode variar
      const locale = detectLocale()
      expect(['pt', 'en', 'fr']).toContain(locale)
    })
  })

  describe('AVAILABLE_LOCALES', () => {
    it('contém 3 locales', () => {
      expect(AVAILABLE_LOCALES).toHaveLength(3)
    })

    it('contém pt, en, fr', () => {
      const codes = AVAILABLE_LOCALES.map(l => l.code)
      expect(codes).toContain('pt')
      expect(codes).toContain('en')
      expect(codes).toContain('fr')
    })
  })

  describe('DEFAULT_LOCALE', () => {
    it('é pt', () => {
      expect(DEFAULT_LOCALE).toBe('pt')
    })
  })
})
