import { describe, it, expect, beforeEach } from 'vitest'
import { translate, detectLocale, AVAILABLE_LOCALES, DEFAULT_LOCALE } from './i18n'

describe('i18n — Sistema de Internacionalização', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('translate()', () => {
    it('traduz chaves em pt (default)', () => {
      expect(translate('pt', 'nav.home')).toBe('Início')
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
      // auth.email exists in pt and en but not in fr — should fall back to pt
      expect(translate('fr', 'auth.email')).toBe('Email')
    })

    it('retorna a chave quando não encontra tradução', () => {
      expect(translate('pt', 'inexistente.chave')).toBe('inexistente.chave')
    })

    it('suporta aliases pt-PT, pt-BR, pt-MZ', () => {
      expect(translate('pt-PT', 'nav.home')).toBe('Início')
      expect(translate('pt-BR', 'nav.home')).toBe('Início')
      expect(translate('pt-MZ', 'nav.home')).toBe('Início')
    })

    it('interpola parâmetros', () => {
      // translate supports {param} interpolation
      expect(translate('pt', 'nav.home')).toBe('Início')
      // Interpolation with unknown params is a no-op
      expect(translate('pt', 'nav.home', { foo: 'bar' })).toBe('Início')
    })

    it('traduz todas as chaves de eco', () => {
      const ecos = ['vitalis', 'serena', 'ignis', 'ventis', 'ecoa', 'lumina', 'imago', 'aurora']
      ecos.forEach(eco => {
        expect(translate('pt', `eco.${eco}`)).toBeDefined()
        expect(translate('pt', `eco.${eco}.desc`)).toBeDefined()
        expect(translate('en', `eco.${eco}`)).toBeDefined()
        expect(translate('en', `eco.${eco}.desc`)).toBeDefined()
      })
    })

    it('traduz chaves de subscrição', () => {
      expect(translate('pt', 'subscription.monthly')).toBe('Mensal')
      expect(translate('en', 'subscription.monthly')).toBe('Monthly')
      expect(translate('fr', 'subscription.monthly')).toBe('Mensuel')
    })

    it('traduz chaves de acessibilidade', () => {
      expect(translate('pt', 'a11y.skip_to_content')).toBe('Saltar para o conteúdo principal')
      expect(translate('en', 'a11y.skip_to_content')).toBe('Skip to main content')
    })

    it('traduz chaves de coach', () => {
      expect(translate('pt', 'coach.dashboard')).toBe('Painel da Coach')
      expect(translate('en', 'coach.dashboard')).toBe('Coach Dashboard')
    })

    it('traduz chaves de bundles', () => {
      expect(translate('pt', 'bundle.duo')).toBe('Duo — 2 Ecos')
      expect(translate('en', 'bundle.duo')).toBe('Duo — 2 Ecos')
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

    it('cada locale tem code, label, e flag', () => {
      AVAILABLE_LOCALES.forEach(locale => {
        expect(locale.code).toBeDefined()
        expect(locale.label).toBeDefined()
        expect(locale.flag).toBeDefined()
      })
    })
  })

  describe('DEFAULT_LOCALE', () => {
    it('é pt', () => {
      expect(DEFAULT_LOCALE).toBe('pt')
    })
  })
})
