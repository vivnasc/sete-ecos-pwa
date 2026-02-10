/**
 * SETE ECOS — Sistema de Internacionalização (i18n)
 *
 * Framework leve de i18n sem dependências externas.
 * Suporta: pt-PT (default), pt-BR, en, fr
 *
 * Uso:
 *   import { useI18n } from '../contexts/I18nContext'
 *   const { t, locale, setLocale, availableLocales } = useI18n()
 *   t('nav.home') // "Início"
 */

// Traduções organizadas por namespace
const translations = {
  'pt': {
    // Navegação
    'nav.home': 'Inicio',
    'nav.account': 'Conta',
    'nav.profile': 'Perfil',
    'nav.community': 'Comunidade',
    'nav.logout': 'Sair',
    'nav.login': 'Entrar',
    'nav.register': 'Criar conta',

    // Comum
    'common.loading': 'A carregar...',
    'common.error': 'Algo correu mal',
    'common.retry': 'Tentar novamente',
    'common.back': 'Voltar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Fechar',
    'common.search': 'Pesquisar',
    'common.next': 'Seguinte',
    'common.previous': 'Anterior',
    'common.submit': 'Submeter',
    'common.free': 'Gratuito',
    'common.coming_soon': 'Em breve',
    'common.subscribe': 'Subscrever',

    // Ecos
    'eco.vitalis': 'Vitalis',
    'eco.vitalis.desc': 'Nutrição & Corpo',
    'eco.serena': 'Serena',
    'eco.serena.desc': 'Emoção & Equilíbrio',
    'eco.ignis': 'Ignis',
    'eco.ignis.desc': 'Vontade & Foco',
    'eco.ventis': 'Ventis',
    'eco.ventis.desc': 'Energia & Ritmo',
    'eco.ecoa': 'Ecoa',
    'eco.ecoa.desc': 'Expressão & Voz',
    'eco.lumina': 'Lumina',
    'eco.lumina.desc': 'Visão & Diagnóstico',
    'eco.imago': 'Imago',
    'eco.imago.desc': 'Identidade',
    'eco.aurora': 'Aurora',
    'eco.aurora.desc': 'Integração Final',

    // Acessibilidade
    'a11y.skip_to_content': 'Saltar para o conteudo principal',
    'a11y.open_menu': 'Abrir menu',
    'a11y.close_menu': 'Fechar menu',
    'a11y.dark_mode': 'Alternar modo escuro',
    'a11y.language': 'Alterar idioma',

    // Error Boundary
    'error.title': 'Algo correu mal',
    'error.description': 'Ocorreu um erro inesperado. Podes tentar recarregar esta secção ou voltar ao início.',
    'error.retry': 'Tentar novamente',
    'error.go_home': 'Voltar ao inicio',

    // Sustentabilidade
    'sustainability.title': 'Plataforma Eco-Digital',
    'sustainability.subtitle': 'Compromisso com sustentabilidade digital',

    // Auth
    'auth.email': 'Email',
    'auth.password': 'Palavra-passe',
    'auth.forgot_password': 'Esqueceste a palavra-passe?',
    'auth.no_account': 'Ainda não tens conta?',
    'auth.has_account': 'Já tens conta?',

    // Subscrições
    'subscription.active': 'Subscrição ativa',
    'subscription.expired': 'Subscrição expirada',
    'subscription.trial': 'Periodo de teste',
    'subscription.monthly': 'Mensal',
    'subscription.semestral': 'Semestral',
    'subscription.annual': 'Anual',
  },

  'en': {
    'nav.home': 'Home',
    'nav.account': 'Account',
    'nav.profile': 'Profile',
    'nav.community': 'Community',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Create account',

    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try again',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.free': 'Free',
    'common.coming_soon': 'Coming soon',
    'common.subscribe': 'Subscribe',

    'eco.vitalis': 'Vitalis',
    'eco.vitalis.desc': 'Nutrition & Body',
    'eco.serena': 'Serena',
    'eco.serena.desc': 'Emotion & Balance',
    'eco.ignis': 'Ignis',
    'eco.ignis.desc': 'Will & Focus',
    'eco.ventis': 'Ventis',
    'eco.ventis.desc': 'Energy & Rhythm',
    'eco.ecoa': 'Ecoa',
    'eco.ecoa.desc': 'Expression & Voice',
    'eco.lumina': 'Lumina',
    'eco.lumina.desc': 'Vision & Diagnosis',
    'eco.imago': 'Imago',
    'eco.imago.desc': 'Identity',
    'eco.aurora': 'Aurora',
    'eco.aurora.desc': 'Final Integration',

    'a11y.skip_to_content': 'Skip to main content',
    'a11y.open_menu': 'Open menu',
    'a11y.close_menu': 'Close menu',
    'a11y.dark_mode': 'Toggle dark mode',
    'a11y.language': 'Change language',

    'error.title': 'Something went wrong',
    'error.description': 'An unexpected error occurred. You can try reloading this section or go back to the home page.',
    'error.retry': 'Try again',
    'error.go_home': 'Go home',

    'sustainability.title': 'Eco-Digital Platform',
    'sustainability.subtitle': 'Committed to digital sustainability',

    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgot_password': 'Forgot your password?',
    'auth.no_account': "Don't have an account?",
    'auth.has_account': 'Already have an account?',

    'subscription.active': 'Active subscription',
    'subscription.expired': 'Subscription expired',
    'subscription.trial': 'Trial period',
    'subscription.monthly': 'Monthly',
    'subscription.semestral': 'Semi-annual',
    'subscription.annual': 'Annual',
  },

  'fr': {
    'nav.home': 'Accueil',
    'nav.account': 'Compte',
    'nav.profile': 'Profil',
    'nav.community': 'Communaute',
    'nav.logout': 'Deconnexion',
    'nav.login': 'Connexion',
    'nav.register': 'Creer un compte',

    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.retry': 'Reessayer',
    'common.back': 'Retour',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.free': 'Gratuit',
    'common.coming_soon': 'Bientot disponible',
    'common.subscribe': 'S\'abonner',

    'error.title': 'Une erreur est survenue',
    'error.description': 'Une erreur inattendue s\'est produite. Vous pouvez recharger cette section ou revenir a la page d\'accueil.',
    'error.retry': 'Reessayer',
    'error.go_home': 'Retour a l\'accueil',
  }
}

// Alias pt-PT, pt-BR, pt-MZ para pt
translations['pt-PT'] = translations['pt']
translations['pt-BR'] = translations['pt']
translations['pt-MZ'] = translations['pt']

export const AVAILABLE_LOCALES = [
  { code: 'pt', label: 'Portugues', flag: '🇵🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
]

export const DEFAULT_LOCALE = 'pt'

/**
 * Detectar locale preferido do utilizador
 */
export function detectLocale() {
  // 1. Preferência guardada
  const saved = localStorage.getItem('sete-ecos-locale')
  if (saved && translations[saved]) return saved

  // 2. Preferência do browser
  const browserLang = navigator.language?.split('-')[0]
  if (browserLang && translations[browserLang]) return browserLang

  // 3. Default
  return DEFAULT_LOCALE
}

/**
 * Obter tradução por chave
 * @param {string} locale - Código do locale
 * @param {string} key - Chave da tradução (ex: 'nav.home')
 * @param {object} params - Parâmetros para interpolação
 * @returns {string} Texto traduzido ou a chave como fallback
 */
export function translate(locale, key, params = {}) {
  const localeTranslations = translations[locale] || translations[DEFAULT_LOCALE]
  let text = localeTranslations[key]

  // Fallback para pt se não encontrar no locale actual
  if (!text && locale !== DEFAULT_LOCALE) {
    text = translations[DEFAULT_LOCALE][key]
  }

  // Se não encontrou em lado nenhum, retorna a chave
  if (!text) return key

  // Interpolação: t('hello', { name: 'Maria' }) => "Olá, Maria"
  if (params && Object.keys(params).length > 0) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), value)
    })
  }

  return text
}

export default translations
