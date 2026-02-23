/**
 * SETE ECOS — Sistema de Internacionalização (i18n)
 *
 * Framework leve de i18n sem dependências externas.
 * Suporta: pt-PT (default), pt-BR, en, fr
 *
 * Traduções modulares: cada módulo pode ter o seu ficheiro em src/lib/i18n/
 * que é fundido automaticamente com as traduções base.
 *
 * Uso:
 *   import { useI18n } from '../contexts/I18nContext'
 *   const { t, locale, setLocale, availableLocales } = useI18n()
 *   t('nav.home') // "Início"
 */

import { luminaTranslations } from './i18n/lumina.js';
import { comunidadeTranslations } from './i18n/comunidade.js';
import { auroraTranslations } from './i18n/aurora.js';
import { aureaTranslations } from './i18n/aurea.js';
import { serenaTranslations } from './i18n/serena.js';
import { ignisTranslations } from './i18n/ignis.js';
import { ventisTranslations } from './i18n/ventis.js';
import { ecoaTranslations } from './i18n/ecoa.js';
import { imagoTranslations } from './i18n/imago.js';
import { vitalisTranslations } from './i18n/vitalis.js';

// Traduções base organizadas por namespace
const baseTranslations = {
  'pt': {
    // Navegação
    'nav.home': 'Início',
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
    'a11y.skip_to_content': 'Saltar para o conteúdo principal',
    'a11y.open_menu': 'Abrir menu',
    'a11y.close_menu': 'Fechar menu',
    'a11y.dark_mode': 'Alternar modo escuro',
    'a11y.language': 'Alterar idioma',

    // Error Boundary
    'error.title': 'Algo correu mal',
    'error.description': 'Ocorreu um erro inesperado. Podes tentar recarregar esta secção ou voltar ao início.',
    'error.retry': 'Tentar novamente',
    'error.go_home': 'Voltar ao início',

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
    'subscription.trial': 'Período de teste',
    'subscription.monthly': 'Mensal',
    'subscription.semestral': 'Semestral',
    'subscription.annual': 'Anual',

    // Serena
    'serena.dashboard': 'Painel Serena',
    'serena.diario': 'Diário Emocional',
    'serena.respiracao': 'Respiração Guiada',
    'serena.sos': 'SOS Emocional',
    'serena.praticas': 'Práticas de Fluidez',
    'serena.rituais': 'Rituais de Libertação',
    'serena.mapa': 'Mapa Emocional',
    'serena.ciclo': 'Ciclo Emocional',
    'serena.padroes': 'Detector de Padrões',
    'serena.ciclo_menstrual': 'Ciclo Menstrual',
    'serena.biblioteca': 'Biblioteca de Emoções',

    // Ignis
    'ignis.dashboard': 'Painel Ignis',
    'ignis.escolhas': 'Escolhas Conscientes',
    'ignis.foco': 'Foco Consciente',
    'ignis.dispersao': 'Rastreador de Dispersão',
    'ignis.corte': 'Exercício de Corte',
    'ignis.bussola': 'Bússola de Valores',
    'ignis.conquistas': 'Diário de Conquistas',
    'ignis.desafios': 'Desafios de Fogo',
    'ignis.plano': 'Plano de Acção',

    // Ventis
    'ventis.dashboard': 'Painel Ventis',
    'ventis.energia': 'Monitor de Energia',
    'ventis.rotinas': 'Construtor de Rotinas',
    'ventis.pausas': 'Pausas Conscientes',
    'ventis.movimento': 'Movimento Flow',
    'ventis.natureza': 'Conexão com a Natureza',
    'ventis.ritmo': 'Análise de Ritmo',
    'ventis.picos': 'Mapa de Picos e Vales',
    'ventis.burnout': 'Detector de Burnout',
    'ventis.rituais': 'Rituais vs Rotinas',

    // Ecoa
    'ecoa.dashboard': 'Painel Ecoa',
    'ecoa.mapa': 'Mapa de Silenciamento',
    'ecoa.micro_voz': 'Micro-Voz',
    'ecoa.biblioteca': 'Biblioteca de Frases',
    'ecoa.voz_recuperada': 'Voz Recuperada',
    'ecoa.diario': 'Diário de Voz',
    'ecoa.cartas': 'Cartas Não Enviadas',
    'ecoa.afirmacoes': 'Afirmações Diárias',
    'ecoa.exercicios': 'Exercícios de Expressão',
    'ecoa.comunicacao': 'Comunicação Assertiva',
    'ecoa.padroes': 'Padrões de Expressão',

    // Imago
    'imago.dashboard': 'Painel Imago',
    'imago.espelho': 'Espelho Triplo',
    'imago.arqueologia': 'Arqueologia de Si',
    'imago.nomeacao': 'Nomeação',
    'imago.mapa': 'Mapa de Identidade',
    'imago.valores': 'Valores Essenciais',
    'imago.roupa': 'Roupa como Identidade',
    'imago.timeline': 'Timeline da Jornada',
    'imago.integracao': 'Integração dos Ecos',
    'imago.meditacoes': 'Meditações de Essência',
    'imago.visao': 'Visão de Futuro',

    // Aurora
    'aurora.dashboard': 'Painel Aurora',
    'aurora.cerimonia': 'Cerimónia de Graduação',
    'aurora.antes_depois': 'Antes & Depois',
    'aurora.resumo': 'Resumo da Jornada',
    'aurora.manutencao': 'Modo Manutenção',
    'aurora.mentoria': 'Mentoria',
    'aurora.ritual': 'Ritual Aurora',
    'aurora.renovacao': 'Renovação Anual',

    // Bundles
    'bundle.duo': 'Duo — 2 Ecos',
    'bundle.trio': 'Trio — 3 Ecos',
    'bundle.jornada': 'Jornada Completa — 5+ Ecos',
    'bundle.tudo': 'Tudo — Todos os Ecos',

    // Coach
    'coach.dashboard': 'Painel da Coach',
    'coach.clients': 'Clientes',
    'coach.all_ecos': 'Todos os Ecos',

    // Home
    'home.loading': 'A preparar o teu espaço...',
    'home.greeting_morning': 'Bom dia',
    'home.greeting_afternoon': 'Boa tarde',
    'home.greeting_evening': 'Boa noite',
    'home.transformation_space': 'O teu espaço de transformação',
    'home.your_ecos': 'Os teus Ecos',
    'home.daily_diagnosis': 'Diagnóstico diário',
    'home.body_nutrition': 'Corpo & Nutrição',
    'home.selfcare_beauty': 'Autocuidado & Beleza',
    'home.reflection_sharing': 'Reflexão & Partilha',
    'home.active': 'Ativo',
    'home.start': 'Começar',
    'home.open_access': 'Aberto',
    'home.quick_access': 'Acesso Rápido',
    'home.daily_checkin': 'Check-in Diário',
    'home.record_your_day': 'Registar o teu dia',
    'home.recipes': 'Receitas',
    'home.explore_recipes': 'Explorar receitas saudáveis',
    'home.meal_plan': 'Plano Alimentar',
    'home.your_plan': 'O teu plano personalizado',
    'home.discover': 'Descobrir',
    'home.discover_desc': 'Explora os 7 Ecos e descobre todo o sistema de transformação integral.',
    'home.see_all_ecos': 'Ver todos os Ecos',

    // Minha Conta
    'account.title': 'Minha Conta',
    'account.member_since': 'Membro desde {date}',
    'account.my_ecos': 'Os meus Ecos',
    'account.status_active': 'Activo',
    'account.status_tester': 'Tester',
    'account.status_trial': 'Trial',
    'account.status_pending': 'Pendente',
    'account.status_expired': 'Expirado',
    'account.status_cancelled': 'Cancelado',
    'account.expires': 'Expira: {date}',
    'account.no_subscription': 'Sem subscrição',
    'account.open': 'Abrir',
    'account.subscribe': 'Subscrever',
    'account.settings': 'Definições',
    'account.language': 'Idioma',
    'account.edit_profile': 'Editar Perfil',
    'account.change_password': 'Alterar Password',
    'account.logout': 'Terminar Sessão',
    'account.need_help': 'Precisas de ajuda?',

    // Navigation
    'nav.hub': 'Hub',
    'nav.rio': 'Rio',
    'nav.circles': 'Círculos',
    'nav.fire': 'Fogueira',
    'nav.whispers': 'Sussurros',
    'nav.navigate_to': 'Navegar para {label}',
    'nav.talk_to_vivianne': 'Falar com Vivianne',
    'nav.talk_to_coach': 'Falar com Coach {name}',
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

    // Serena
    'serena.dashboard': 'Serena Dashboard',
    'serena.diario': 'Emotional Journal',
    'serena.respiracao': 'Guided Breathing',
    'serena.sos': 'Emotional SOS',
    'serena.praticas': 'Fluidity Practices',
    'serena.rituais': 'Release Rituals',
    'serena.mapa': 'Emotional Map',
    'serena.ciclo': 'Emotional Cycle',
    'serena.padroes': 'Pattern Detector',
    'serena.ciclo_menstrual': 'Menstrual Cycle',
    'serena.biblioteca': 'Emotion Library',

    // Ignis
    'ignis.dashboard': 'Ignis Dashboard',
    'ignis.escolhas': 'Conscious Choices',
    'ignis.foco': 'Conscious Focus',
    'ignis.dispersao': 'Dispersion Tracker',
    'ignis.corte': 'Cutting Exercise',
    'ignis.bussola': 'Values Compass',
    'ignis.conquistas': 'Achievements Journal',
    'ignis.desafios': 'Fire Challenges',
    'ignis.plano': 'Action Plan',

    // Ventis
    'ventis.dashboard': 'Ventis Dashboard',
    'ventis.energia': 'Energy Monitor',
    'ventis.rotinas': 'Routine Builder',
    'ventis.pausas': 'Mindful Breaks',
    'ventis.movimento': 'Movement Flow',
    'ventis.natureza': 'Nature Connection',
    'ventis.ritmo': 'Rhythm Analysis',
    'ventis.picos': 'Peaks & Valleys Map',
    'ventis.burnout': 'Burnout Detector',
    'ventis.rituais': 'Rituals vs Routines',

    // Ecoa
    'ecoa.dashboard': 'Ecoa Dashboard',
    'ecoa.mapa': 'Silencing Map',
    'ecoa.micro_voz': 'Micro-Voice',
    'ecoa.biblioteca': 'Phrase Library',
    'ecoa.voz_recuperada': 'Recovered Voice',
    'ecoa.diario': 'Voice Journal',
    'ecoa.cartas': 'Unsent Letters',
    'ecoa.afirmacoes': 'Daily Affirmations',
    'ecoa.exercicios': 'Expression Exercises',
    'ecoa.comunicacao': 'Assertive Communication',
    'ecoa.padroes': 'Expression Patterns',

    // Imago
    'imago.dashboard': 'Imago Dashboard',
    'imago.espelho': 'Triple Mirror',
    'imago.arqueologia': 'Self Archaeology',
    'imago.nomeacao': 'Self-Naming',
    'imago.mapa': 'Identity Map',
    'imago.valores': 'Core Values',
    'imago.roupa': 'Clothing as Identity',
    'imago.timeline': 'Journey Timeline',
    'imago.integracao': 'Eco Integration',
    'imago.meditacoes': 'Essence Meditations',
    'imago.visao': 'Future Vision',

    // Aurora
    'aurora.dashboard': 'Aurora Dashboard',
    'aurora.cerimonia': 'Graduation Ceremony',
    'aurora.antes_depois': 'Before & After',
    'aurora.resumo': 'Journey Summary',
    'aurora.manutencao': 'Maintenance Mode',
    'aurora.mentoria': 'Mentoring',
    'aurora.ritual': 'Aurora Ritual',
    'aurora.renovacao': 'Annual Renewal',

    // Bundles
    'bundle.duo': 'Duo — 2 Ecos',
    'bundle.trio': 'Trio — 3 Ecos',
    'bundle.jornada': 'Complete Journey — 5+ Ecos',
    'bundle.tudo': 'Everything — All Ecos',

    // Coach
    'coach.dashboard': 'Coach Dashboard',
    'coach.clients': 'Clients',
    'coach.all_ecos': 'All Ecos',

    // Home
    'home.loading': 'Preparing your space...',
    'home.greeting_morning': 'Good morning',
    'home.greeting_afternoon': 'Good afternoon',
    'home.greeting_evening': 'Good evening',
    'home.transformation_space': 'Your transformation space',
    'home.your_ecos': 'Your Ecos',
    'home.daily_diagnosis': 'Daily diagnosis',
    'home.body_nutrition': 'Body & Nutrition',
    'home.selfcare_beauty': 'Self-care & Beauty',
    'home.reflection_sharing': 'Reflection & Sharing',
    'home.active': 'Active',
    'home.start': 'Start',
    'home.open_access': 'Open',
    'home.quick_access': 'Quick Access',
    'home.daily_checkin': 'Daily Check-in',
    'home.record_your_day': 'Record your day',
    'home.recipes': 'Recipes',
    'home.explore_recipes': 'Explore healthy recipes',
    'home.meal_plan': 'Meal Plan',
    'home.your_plan': 'Your personalised plan',
    'home.discover': 'Discover',
    'home.discover_desc': 'Explore the 7 Ecos and discover the full integral transformation system.',
    'home.see_all_ecos': 'See all Ecos',

    // Account
    'account.title': 'My Account',
    'account.member_since': 'Member since {date}',
    'account.my_ecos': 'My Ecos',
    'account.status_active': 'Active',
    'account.status_tester': 'Tester',
    'account.status_trial': 'Trial',
    'account.status_pending': 'Pending',
    'account.status_expired': 'Expired',
    'account.status_cancelled': 'Cancelled',
    'account.expires': 'Expires: {date}',
    'account.no_subscription': 'No subscription',
    'account.open': 'Open',
    'account.subscribe': 'Subscribe',
    'account.settings': 'Settings',
    'account.language': 'Language',
    'account.edit_profile': 'Edit Profile',
    'account.change_password': 'Change Password',
    'account.logout': 'Log Out',
    'account.need_help': 'Need help?',

    // Navigation
    'nav.hub': 'Hub',
    'nav.rio': 'Stream',
    'nav.circles': 'Circles',
    'nav.fire': 'Bonfire',
    'nav.whispers': 'Whispers',
    'nav.navigate_to': 'Navigate to {label}',
    'nav.talk_to_vivianne': 'Talk to Vivianne',
    'nav.talk_to_coach': 'Talk to Coach {name}',
  },

  'fr': {
    'nav.home': 'Accueil',
    'nav.account': 'Compte',
    'nav.profile': 'Profil',
    'nav.community': 'Communauté',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Connexion',
    'nav.register': 'Créer un compte',

    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.retry': 'Réessayer',
    'common.back': 'Retour',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.free': 'Gratuit',
    'common.coming_soon': 'Bientôt disponible',
    'common.subscribe': 'S\'abonner',

    'error.title': 'Une erreur est survenue',
    'error.description': 'Une erreur inattendue s\'est produite. Vous pouvez recharger cette section ou revenir à la page d\'accueil.',
    'error.retry': 'Réessayer',
    'error.go_home': 'Retour à l\'accueil',

    // Ecos
    'eco.vitalis': 'Vitalis',
    'eco.vitalis.desc': 'Nutrition & Corps',
    'eco.serena': 'Serena',
    'eco.serena.desc': 'Émotion & Équilibre',
    'eco.ignis': 'Ignis',
    'eco.ignis.desc': 'Volonté & Focus',
    'eco.ventis': 'Ventis',
    'eco.ventis.desc': 'Énergie & Rythme',
    'eco.ecoa': 'Ecoa',
    'eco.ecoa.desc': 'Expression & Voix',
    'eco.lumina': 'Lumina',
    'eco.lumina.desc': 'Vision & Diagnostic',
    'eco.imago': 'Imago',
    'eco.imago.desc': 'Identité',
    'eco.aurora': 'Aurora',
    'eco.aurora.desc': 'Intégration Finale',

    // Serena
    'serena.dashboard': 'Tableau Serena',
    'serena.diario': 'Journal Émotionnel',
    'serena.respiracao': 'Respiration Guidée',
    'serena.sos': 'SOS Émotionnel',
    'serena.praticas': 'Pratiques de Fluidité',
    'serena.rituais': 'Rituels de Libération',
    'serena.mapa': 'Carte Émotionnelle',
    'serena.ciclo': 'Cycle Émotionnel',
    'serena.padroes': 'Détecteur de Patterns',
    'serena.ciclo_menstrual': 'Cycle Menstruel',
    'serena.biblioteca': 'Bibliothèque d\'Émotions',

    // Ignis
    'ignis.dashboard': 'Tableau Ignis',
    'ignis.escolhas': 'Choix Conscients',
    'ignis.foco': 'Focus Conscient',
    'ignis.dispersao': 'Traqueur de Dispersion',
    'ignis.corte': 'Exercice de Coupe',
    'ignis.bussola': 'Boussole de Valeurs',
    'ignis.conquistas': 'Journal de Conquêtes',
    'ignis.desafios': 'Défis de Feu',
    'ignis.plano': 'Plan d\'Action',

    // Ventis
    'ventis.dashboard': 'Tableau Ventis',
    'ventis.energia': 'Moniteur d\'Énergie',
    'ventis.rotinas': 'Constructeur de Routines',
    'ventis.pausas': 'Pauses Conscientes',
    'ventis.movimento': 'Mouvement Flow',
    'ventis.natureza': 'Connexion Nature',
    'ventis.ritmo': 'Analyse de Rythme',
    'ventis.picos': 'Carte Pics & Creux',
    'ventis.burnout': 'Détecteur de Burnout',
    'ventis.rituais': 'Rituels vs Routines',

    // Ecoa
    'ecoa.dashboard': 'Tableau Ecoa',
    'ecoa.mapa': 'Carte du Silence',
    'ecoa.micro_voz': 'Micro-Voix',
    'ecoa.biblioteca': 'Bibliothèque de Phrases',
    'ecoa.voz_recuperada': 'Voix Récupérée',
    'ecoa.diario': 'Journal de Voix',
    'ecoa.cartas': 'Lettres Non Envoyées',
    'ecoa.afirmacoes': 'Affirmations Quotidiennes',
    'ecoa.exercicios': 'Exercices d\'Expression',
    'ecoa.comunicacao': 'Communication Assertive',
    'ecoa.padroes': 'Patterns d\'Expression',

    // Imago
    'imago.dashboard': 'Tableau Imago',
    'imago.espelho': 'Triple Miroir',
    'imago.arqueologia': 'Archéologie de Soi',
    'imago.nomeacao': 'Auto-Nomination',
    'imago.mapa': 'Carte d\'Identité',
    'imago.valores': 'Valeurs Essentielles',
    'imago.roupa': 'Vêtement comme Identité',
    'imago.timeline': 'Chronologie du Parcours',
    'imago.integracao': 'Intégration des Ecos',
    'imago.meditacoes': 'Méditations d\'Essence',
    'imago.visao': 'Vision du Futur',

    // Aurora
    'aurora.dashboard': 'Tableau Aurora',
    'aurora.cerimonia': 'Cérémonie de Graduation',
    'aurora.antes_depois': 'Avant & Après',
    'aurora.resumo': 'Résumé du Parcours',
    'aurora.manutencao': 'Mode Maintenance',
    'aurora.mentoria': 'Mentorat',
    'aurora.ritual': 'Rituel Aurora',
    'aurora.renovacao': 'Renouvellement Annuel',

    // Bundles
    'bundle.duo': 'Duo — 2 Ecos',
    'bundle.trio': 'Trio — 3 Ecos',
    'bundle.jornada': 'Parcours Complet — 5+ Ecos',
    'bundle.tudo': 'Tout — Tous les Ecos',

    // Subscriptions
    'subscription.active': 'Abonnement actif',
    'subscription.expired': 'Abonnement expiré',
    'subscription.trial': 'Période d\'essai',
    'subscription.monthly': 'Mensuel',
    'subscription.semestral': 'Semestriel',
    'subscription.annual': 'Annuel',

    // Coach
    'coach.dashboard': 'Tableau du Coach',
    'coach.clients': 'Clients',
    'coach.all_ecos': 'Tous les Ecos',

    // Home
    'home.loading': 'Préparation de ton espace...',
    'home.greeting_morning': 'Bonjour',
    'home.greeting_afternoon': 'Bon après-midi',
    'home.greeting_evening': 'Bonsoir',
    'home.transformation_space': 'Ton espace de transformation',
    'home.your_ecos': 'Tes Ecos',
    'home.daily_diagnosis': 'Diagnostic quotidien',
    'home.body_nutrition': 'Corps & Nutrition',
    'home.selfcare_beauty': 'Bien-être & Beauté',
    'home.reflection_sharing': 'Réflexion & Partage',
    'home.active': 'Actif',
    'home.start': 'Commencer',
    'home.open_access': 'Ouvert',
    'home.quick_access': 'Accès Rapide',
    'home.daily_checkin': 'Check-in Quotidien',
    'home.record_your_day': 'Enregistre ta journée',
    'home.recipes': 'Recettes',
    'home.explore_recipes': 'Explorer des recettes saines',
    'home.meal_plan': 'Plan Alimentaire',
    'home.your_plan': 'Ton plan personnalisé',
    'home.discover': 'Découvrir',
    'home.discover_desc': 'Explore les 7 Ecos et découvre le système complet de transformation intégrale.',
    'home.see_all_ecos': 'Voir tous les Ecos',

    // Account
    'account.title': 'Mon Compte',
    'account.member_since': 'Membre depuis {date}',
    'account.my_ecos': 'Mes Ecos',
    'account.status_active': 'Actif',
    'account.status_tester': 'Testeur',
    'account.status_trial': 'Essai',
    'account.status_pending': 'En attente',
    'account.status_expired': 'Expiré',
    'account.status_cancelled': 'Annulé',
    'account.expires': 'Expire : {date}',
    'account.no_subscription': 'Pas d\'abonnement',
    'account.open': 'Ouvrir',
    'account.subscribe': 'S\'abonner',
    'account.settings': 'Paramètres',
    'account.language': 'Langue',
    'account.edit_profile': 'Modifier le Profil',
    'account.change_password': 'Changer le Mot de passe',
    'account.logout': 'Déconnexion',
    'account.need_help': 'Besoin d\'aide ?',

    // Navigation
    'nav.hub': 'Hub',
    'nav.rio': 'Fleuve',
    'nav.circles': 'Cercles',
    'nav.fire': 'Feu de camp',
    'nav.whispers': 'Murmures',
    'nav.navigate_to': 'Naviguer vers {label}',
    'nav.talk_to_vivianne': 'Parler à Vivianne',
    'nav.talk_to_coach': 'Parler au Coach {name}',
  }
}

// Fundir traduções modulares com as traduções base
const translations = {}
for (const locale of ['pt', 'en', 'fr']) {
  translations[locale] = {
    ...(baseTranslations[locale] || {}),
    ...(luminaTranslations[locale] || {}),
    ...(comunidadeTranslations[locale] || {}),
    ...(auroraTranslations[locale] || {}),
    ...(aureaTranslations[locale] || {}),
    ...(serenaTranslations[locale] || {}),
    ...(ignisTranslations[locale] || {}),
    ...(ventisTranslations[locale] || {}),
    ...(ecoaTranslations[locale] || {}),
    ...(imagoTranslations[locale] || {}),
    ...(vitalisTranslations[locale] || {}),
  }
}

// Alias pt-PT, pt-BR, pt-MZ para pt
translations['pt-PT'] = translations['pt']
translations['pt-BR'] = translations['pt']
translations['pt-MZ'] = translations['pt']

export const AVAILABLE_LOCALES = [
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

export const DEFAULT_LOCALE = 'pt'

/**
 * Detectar locale preferido do utilizador
 */
export function detectLocale() {
  // 1. Preferência guardada pelo utilizador (única forma de mudar idioma)
  const saved = localStorage.getItem('sete-ecos-locale')
  if (saved && translations[saved]) return saved

  // 2. Default é sempre PT (plataforma portuguesa)
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
