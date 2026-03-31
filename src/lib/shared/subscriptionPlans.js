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
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 499, price_usd: 9.90, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 2395, price_usd: 47.50, discount: 20, savings_mzn: 599 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 4190, price_usd: 83, discount: 30, savings_mzn: 1798 }
  },
  serena: {
    name: 'Serena',
    table: 'serena_clients',
    color: '#6B8E9B',
    colorDark: '#1a2e3a',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 499, price_usd: 9.90, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 2395, price_usd: 47.50, discount: 20, savings_mzn: 599 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 4190, price_usd: 83, discount: 30, savings_mzn: 1798 }
  },
  ignis: {
    name: 'Ignis',
    table: 'ignis_clients',
    color: '#C1634A',
    colorDark: '#2e1a14',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 499, price_usd: 9.90, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 2395, price_usd: 47.50, discount: 20, savings_mzn: 599 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 4190, price_usd: 83, discount: 30, savings_mzn: 1798 }
  },
  ventis: {
    name: 'Ventis',
    table: 'ventis_clients',
    color: '#5D9B84',
    colorDark: '#1a2e24',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 499, price_usd: 9.90, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 2395, price_usd: 47.50, discount: 20, savings_mzn: 599 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 4190, price_usd: 83, discount: 30, savings_mzn: 1798 }
  },
  ecoa: {
    name: 'Ecoa',
    table: 'ecoa_clients',
    color: '#4A90A4',
    colorDark: '#1a2a34',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 499, price_usd: 9.90, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 2395, price_usd: 47.50, discount: 20, savings_mzn: 599 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 4190, price_usd: 83, discount: 30, savings_mzn: 1798 }
  },
  imago: {
    name: 'Imago',
    table: 'imago_clients',
    color: '#8B7BA5',
    colorDark: '#1a1a2e',
    monthly: { id: 'monthly', name: 'Mensal', duration: 1, price_mzn: 499, price_usd: 9.90, discount: 0 },
    semestral: { id: 'semestral', name: 'Semestral', duration: 6, price_mzn: 2395, price_usd: 47.50, discount: 20, savings_mzn: 599 },
    annual: { id: 'annual', name: 'Anual', duration: 12, price_mzn: 4190, price_usd: 83, discount: 30, savings_mzn: 1798 }
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
// Precos calculados dinamicamente por calculateBundlePrice() com base nos ecos seleccionados
export const BUNDLE_PLANS = {
  duo: {
    id: 'duo',
    name: 'Duo — 2 Ecos',
    description: 'Escolhe 2 ecos a tua escolha',
    discount: 15,
    minEcos: 2,
    maxEcos: 2
  },
  trio: {
    id: 'trio',
    name: 'Trio — 3 Ecos',
    description: 'Escolhe 3 ecos a tua escolha',
    discount: 25,
    minEcos: 3,
    maxEcos: 3
  },
  jornada: {
    id: 'jornada',
    name: 'Jornada Completa — 5+ Ecos',
    description: 'Acesso a 5 ou mais ecos com desconto maximo',
    discount: 35,
    minEcos: 5,
    maxEcos: 7
  },
  tudo: {
    id: 'tudo',
    name: 'Tudo — Todos os 7 Ecos',
    description: 'Acesso completo a todos os 7 ecos (Aurora desbloqueia gratis ao completar todos)',
    discount: 40,
    minEcos: 7,
    maxEcos: 7
  }
}

/**
 * Calcula o preco de um bundle baseado nos ecos seleccionados
 */
export function calculateBundlePrice(ecoKeys, period = 'monthly') {
  if (!ecoKeys || ecoKeys.length < 2) return null

  // Encontrar bundle aplicavel
  let bundle = null
  if (ecoKeys.length >= 7) bundle = BUNDLE_PLANS.tudo
  else if (ecoKeys.length >= 5) bundle = BUNDLE_PLANS.jornada
  else if (ecoKeys.length >= 3) bundle = BUNDLE_PLANS.trio
  else if (ecoKeys.length >= 2) bundle = BUNDLE_PLANS.duo

  if (!bundle) return null

  // Calcular preco individual total (MZN e USD)
  let individualTotal = 0
  let individualTotalUsd = 0
  ecoKeys.forEach(eco => {
    const config = ECO_PLANS[eco]
    if (!config) return
    const plan = config[period]
    individualTotal += plan?.price_mzn || 0
    individualTotalUsd += plan?.price_usd || 0
  })

  const bundlePrice = Math.round(individualTotal * (1 - bundle.discount / 100))
  const bundlePriceUsd = Math.round(individualTotalUsd * (1 - bundle.discount / 100))
  const savings = individualTotal - bundlePrice
  const savingsUsd = individualTotalUsd - bundlePriceUsd

  return {
    bundle,
    individualTotal,
    individualTotalUsd,
    bundlePrice,
    bundlePriceUsd,
    savings,
    savingsUsd,
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

/**
 * Regista pagamento pendente para qualquer eco
 */
export const registerEcoPendingPayment = async (eco, userId, paymentData) => {
  const ecoConfig = ECO_PLANS[eco]
  if (!ecoConfig) return { success: false, error: 'eco_not_found' }

  try {
    const { data, error } = await supabase
      .from(ecoConfig.table)
      .upsert({
        user_id: userId,
        subscription_status: SUBSCRIPTION_STATUS.PENDING,
        payment_method: paymentData.method,
        payment_reference: paymentData.reference,
        payment_amount: paymentData.amount,
        payment_currency: paymentData.currency,
        pacote: paymentData.planId,
        status: 'pendente'
      }, { onConflict: 'user_id' })
      .select()
      .maybeSingle()

    if (error) return { success: false, error }

    // Notificar coach via alerta
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('nome, email')
        .eq('id', userId)
        .maybeSingle()

      if (userData) {
        await supabase.from('vitalis_alerts').insert({
          user_id: userId,
          tipo_alerta: 'novo_pagamento',
          prioridade: 'alta',
          descricao: `[${ecoConfig.name}] Novo pagamento pendente de ${userData.nome || userData.email}: ${paymentData.amount?.toLocaleString()} MZN via ${paymentData.method}. Ref: ${paymentData.reference}`
        })
      }
    } catch (alertErr) {
      console.error('Erro ao criar alerta de pagamento:', alertErr)
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
