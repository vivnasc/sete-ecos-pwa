/**
 * SETE ECOS — Planos de Subscricao Centralizados
 *
 * Todos os ecos usam este ficheiro como fonte de verdade para precos e planos.
 * Cada eco tem os seus proprios planos mas partilham a mesma estrutura.
 */

import { supabase } from '../supabase'

// ===== STATUS DE SUBSCRICAO (partilhado por todos os ecos) =====
export const SUBSCRIPTION_STATUS = {
  TESTER: 'tester',
  TRIAL: 'trial',
  ACTIVE: 'active',
  PENDING: 'pending',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  NONE: null
}

// ===== CONFIGURACAO GLOBAL =====
export const GLOBAL_CONFIG = {
  TRIAL_DAYS: 7,
  CURRENCY_MZN: 'MZN',
  CURRENCY_USD: 'USD',
  PAYPAL_CLIENT_ID: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_PAYPAL_CLIENT_ID : null,
  PAYPAL_MODE: typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_PAYPAL_MODE || 'sandbox') : 'sandbox',
  WHATSAPP_COACH: '258851006473'
}

// ===== PLANOS POR ECO =====
export const ECO_PLANS = {
  vitalis: {
    name: 'Vitalis',
    table: 'vitalis_clients',
    color: '#7C8B6F',
    colorDark: '#5A6B4D',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 2500, price_usd: 38, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 12500, price_usd: 190, discount: 17, savings_mzn: 2500 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 21000, price_usd: 320, discount: 30, savings_mzn: 9000 }
  },
  aurea: {
    name: 'Aurea',
    table: 'aurea_clients',
    color: '#C4A265',
    colorDark: '#2D2A24',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 975, price_usd: 15, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 5265, price_usd: 81, discount: 10, savings_mzn: 585 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 9945, price_usd: 153, discount: 15, savings_mzn: 1755 }
  },
  serena: {
    name: 'Serena',
    table: 'serena_clients',
    color: '#6B8E9B',
    colorDark: '#1a2e3a',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 750, price_usd: 12, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 3825, price_usd: 58, discount: 15, savings_mzn: 675 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 7200, price_usd: 110, discount: 20, savings_mzn: 1800 }
  },
  ignis: {
    name: 'Ignis',
    table: 'ignis_clients',
    color: '#C1634A',
    colorDark: '#2e1a14',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 750, price_usd: 12, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 3825, price_usd: 58, discount: 15, savings_mzn: 675 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 7200, price_usd: 110, discount: 20, savings_mzn: 1800 }
  },
  ventis: {
    name: 'Ventis',
    table: 'ventis_clients',
    color: '#5D9B84',
    colorDark: '#1a2e24',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 750, price_usd: 12, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 3825, price_usd: 58, discount: 15, savings_mzn: 675 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 7200, price_usd: 110, discount: 20, savings_mzn: 1800 }
  },
  ecoa: {
    name: 'Ecoa',
    table: 'ecoa_clients',
    color: '#4A90A4',
    colorDark: '#1a2a34',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 750, price_usd: 12, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 3825, price_usd: 58, discount: 15, savings_mzn: 675 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 7200, price_usd: 110, discount: 20, savings_mzn: 1800 }
  },
  imago: {
    name: 'Imago',
    table: 'imago_clients',
    color: '#8B7BA5',
    colorDark: '#1a1a2e',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 975, price_usd: 15, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 4972, price_usd: 76, discount: 15, savings_mzn: 878 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 9360, price_usd: 144, discount: 20, savings_mzn: 2340 }
  },
  aurora: {
    name: 'Aurora',
    table: 'aurora_clients',
    color: '#D4A5A5',
    colorDark: '#2e1a1a',
    free: true  // Aurora é gratuita — desbloqueia ao completar todos os outros ecos
  }
}

// ===== BUNDLES (PACOTES DE DESCONTO) =====
export const BUNDLE_PLANS = {
  duo: {
    id: 'duo',
    name: 'Duo — 2 Ecos',
    description: 'Escolhe 2 ecos a tua escolha',
    discount: 15,
    minEcos: 2,
    maxEcos: 2,
    monthly: { price_mzn: 1275, price_usd: 20 },
    semestral: { price_mzn: 6502, price_usd: 100 },
    annual: { price_mzn: 12240, price_usd: 187 }
  },
  trio: {
    id: 'trio',
    name: 'Trio — 3 Ecos',
    description: 'Escolhe 3 ecos a tua escolha',
    discount: 25,
    minEcos: 3,
    maxEcos: 3,
    monthly: { price_mzn: 1687, price_usd: 27 },
    semestral: { price_mzn: 8606, price_usd: 132 },
    annual: { price_mzn: 16200, price_usd: 248 }
  },
  jornada: {
    id: 'jornada',
    name: 'Jornada Completa — 5+ Ecos',
    description: 'Acesso a 5 ou mais ecos com desconto maximo',
    discount: 35,
    minEcos: 5,
    maxEcos: 7,
    monthly: { price_mzn: 2437, price_usd: 39 },
    semestral: { price_mzn: 12431, price_usd: 190 },
    annual: { price_mzn: 23400, price_usd: 358 }
  },
  tudo: {
    id: 'tudo',
    name: 'Tudo — Todos os 7 Ecos',
    description: 'Acesso completo a todos os 7 ecos (Aurora desbloqueia grátis ao completar todos)',
    discount: 40,
    minEcos: 7,
    maxEcos: 7,
    monthly: { price_mzn: 2800, price_usd: 44 },
    semestral: { price_mzn: 14280, price_usd: 219 },
    annual: { price_mzn: 26880, price_usd: 412 }
  }
}

/**
 * Calcula o preco de um bundle baseado nos ecos seleccionados
 */
export function calculateBundlePrice(ecoKeys, period = 'monthly') {
  if (!ecoKeys || ecoKeys.length < 2) return null

  // Encontrar bundle aplicavel
  let bundle = null
  if (ecoKeys.length >= 8) bundle = BUNDLE_PLANS.tudo
  else if (ecoKeys.length >= 5) bundle = BUNDLE_PLANS.jornada
  else if (ecoKeys.length >= 3) bundle = BUNDLE_PLANS.trio
  else if (ecoKeys.length >= 2) bundle = BUNDLE_PLANS.duo

  if (!bundle) return null

  // Calcular preco individual total
  const individualTotal = ecoKeys.reduce((total, eco) => {
    const config = ECO_PLANS[eco]
    if (!config) return total
    const plan = config[period]
    return total + (plan?.price_mzn || 0)
  }, 0)

  const bundlePrice = bundle[period]?.price_mzn || Math.round(individualTotal * (1 - bundle.discount / 100))
  const savings = individualTotal - bundlePrice

  return {
    bundle,
    individualTotal,
    bundlePrice,
    savings,
    discount: bundle.discount,
    period
  }
}

// ===== FUNCOES DE ACESSO GENERICAS =====

/**
 * Verifica se um utilizador tem acesso a um eco especifico
 * @param {string} eco - Nome do eco (serena, ignis, ventis, etc.)
 * @param {string} userId - ID do utilizador na tabela users
 * @returns {Object} { hasAccess, status, reason, daysLeft, expiresAt }
 */
export const checkEcoAccess = async (eco, userId) => {
  const ecoConfig = ECO_PLANS[eco]
  if (!ecoConfig) {
    return { hasAccess: false, status: SUBSCRIPTION_STATUS.NONE, reason: 'eco_not_found' }
  }

  // Aurora tem lógica própria — é gratuita ao completar todos os ecos
  if (eco === 'aurora') {
    const { checkAuroraAccess } = await import('../aurora/subscriptions')
    return checkAuroraAccess(userId)
  }

  try {
    const { data: client, error } = await supabase
      .from(ecoConfig.table)
      .select('subscription_status, subscription_expires, trial_started')
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !client) {
      return { hasAccess: false, status: SUBSCRIPTION_STATUS.NONE, reason: 'no_client' }
    }

    const status = client.subscription_status

    // Testers tem acesso permanente
    if (status === SUBSCRIPTION_STATUS.TESTER) {
      return { hasAccess: true, status, reason: 'tester' }
    }

    // Subscrição activa
    if (status === SUBSCRIPTION_STATUS.ACTIVE) {
      if (client.subscription_expires) {
        const expires = new Date(client.subscription_expires)
        if (expires > new Date()) {
          const daysLeft = Math.ceil((expires - new Date()) / (24 * 60 * 60 * 1000))
          return { hasAccess: true, status, reason: 'active', expiresAt: expires, daysLeft }
        }
        // Expirou
        await updateEcoSubscriptionStatus(eco, userId, SUBSCRIPTION_STATUS.EXPIRED)
        return { hasAccess: false, status: SUBSCRIPTION_STATUS.EXPIRED, reason: 'expired' }
      }
      return { hasAccess: true, status, reason: 'active' }
    }

    // Trial
    if (status === SUBSCRIPTION_STATUS.TRIAL) {
      if (client.trial_started) {
        const trialEnd = new Date(client.trial_started)
        trialEnd.setDate(trialEnd.getDate() + GLOBAL_CONFIG.TRIAL_DAYS)
        const now = new Date()
        if (trialEnd > now) {
          const daysLeft = Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))
          return { hasAccess: true, status, reason: 'trial', daysLeft, expiresAt: trialEnd }
        }
        // Trial expirou
        await updateEcoSubscriptionStatus(eco, userId, SUBSCRIPTION_STATUS.EXPIRED)
        return { hasAccess: false, status: SUBSCRIPTION_STATUS.EXPIRED, reason: 'trial_expired' }
      }
    }

    // Pagamento pendente
    if (status === SUBSCRIPTION_STATUS.PENDING) {
      return { hasAccess: false, status, reason: 'pending_payment' }
    }

    return { hasAccess: false, status: status || SUBSCRIPTION_STATUS.NONE, reason: 'no_access' }
  } catch (error) {
    console.error(`checkEcoAccess(${eco}):`, error)
    return { hasAccess: false, status: SUBSCRIPTION_STATUS.NONE, reason: 'error' }
  }
}

/**
 * Actualiza o status de subscricao de um eco
 */
export const updateEcoSubscriptionStatus = async (eco, userId, newStatus) => {
  const ecoConfig = ECO_PLANS[eco]
  if (!ecoConfig) return

  try {
    await supabase
      .from(ecoConfig.table)
      .update({
        subscription_status: newStatus,
        subscription_updated: new Date().toISOString()
      })
      .eq('user_id', userId)
  } catch (error) {
    console.error(`updateEcoSubscriptionStatus(${eco}):`, error)
  }
}

/**
 * Inicia trial de 7 dias para um eco
 */
export const startEcoTrial = async (eco, userId) => {
  const ecoConfig = ECO_PLANS[eco]
  if (!ecoConfig) return null

  try {
    const { data, error } = await supabase
      .from(ecoConfig.table)
      .upsert({
        user_id: userId,
        subscription_status: SUBSCRIPTION_STATUS.TRIAL,
        trial_started: new Date().toISOString(),
        status: 'activo'
      }, { onConflict: 'user_id' })
      .select()
      .maybeSingle()

    if (error) {
      console.error(`startEcoTrial(${eco}):`, error)
      return null
    }
    return data
  } catch (error) {
    console.error(`startEcoTrial(${eco}):`, error)
    return null
  }
}

/**
 * Retorna os planos disponiveis para um eco
 */
export const getEcoPlans = (eco) => {
  const config = ECO_PLANS[eco]
  if (!config) return []
  return [config.monthly, config.semestral, config.annual].filter(Boolean)
}

/**
 * Retorna a cor e nome de um eco
 */
export const getEcoTheme = (eco) => {
  const config = ECO_PLANS[eco]
  if (!config) return { name: eco, color: '#666', colorDark: '#1a1a1a' }
  return { name: config.name, color: config.color, colorDark: config.colorDark }
}
