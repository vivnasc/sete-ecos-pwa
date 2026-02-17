/**
 * SETE ECOS — Module Factory
 *
 * Funcoes genericas para criar guardas de acesso, gestao de subscricoes,
 * base de gamificacao e coach IA para qualquer eco.
 *
 * Reduz duplicacao entre modulos — cada eco usa este factory como base.
 */

import { supabase } from '../supabase'
import { ECO_PLANS, SUBSCRIPTION_STATUS, GLOBAL_CONFIG, checkEcoAccess, startEcoTrial, updateEcoSubscriptionStatus } from './subscriptionPlans'

/**
 * Cria um gestor de subscricoes para um eco
 * @param {string} eco - Nome do eco (serena, ignis, ventis, etc.)
 * @returns {Object} Funcoes de gestao de subscricao
 */
export function createSubscriptionManager(eco) {
  const config = ECO_PLANS[eco]
  if (!config) throw new Error(`Eco "${eco}" nao encontrado nos planos`)

  return {
    table: config.table,
    plans: [config.monthly, config.semestral, config.annual],

    checkAccess: (userId) => checkEcoAccess(eco, userId),
    startTrial: (userId) => startEcoTrial(eco, userId),
    updateStatus: (userId, status) => updateEcoSubscriptionStatus(eco, userId, status),

    async setAsTester(userId) {
      try {
        const { error } = await supabase
          .from(config.table)
          .upsert({
            user_id: userId,
            subscription_status: SUBSCRIPTION_STATUS.TESTER,
            subscription_updated: new Date().toISOString()
          }, { onConflict: 'user_id' })

        return !error
      } catch (err) {
        console.error(`setAsTester(${eco}):`, err)
        return false
      }
    },

    async confirmPayment(userId, paymentDetails) {
      try {
        const plan = config[paymentDetails.planKey] || config.monthly
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + plan.duration)

        const { error } = await supabase
          .from(config.table)
          .upsert({
            user_id: userId,
            subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
            subscription_expires: expiresAt.toISOString(),
            subscription_plan: paymentDetails.planKey,
            payment_method: paymentDetails.method || 'manual',
            payment_reference: paymentDetails.reference || null,
            payment_amount: plan.price_mzn,
            subscription_updated: new Date().toISOString()
          }, { onConflict: 'user_id' })

        return !error
      } catch (err) {
        console.error(`confirmPayment(${eco}):`, err)
        return false
      }
    },

    async registerPendingPayment(userId, paymentDetails) {
      try {
        const { error } = await supabase
          .from(config.table)
          .upsert({
            user_id: userId,
            subscription_status: SUBSCRIPTION_STATUS.PENDING,
            payment_method: paymentDetails.method,
            payment_reference: paymentDetails.reference,
            payment_amount: paymentDetails.amount,
            subscription_updated: new Date().toISOString()
          }, { onConflict: 'user_id' })

        return !error
      } catch (err) {
        console.error(`registerPendingPayment(${eco}):`, err)
        return false
      }
    },

    async getStats() {
      try {
        const { data } = await supabase
          .from(config.table)
          .select('subscription_status')

        if (!data) return { total: 0 }

        const stats = { total: data.length }
        data.forEach(c => {
          const status = c.subscription_status || 'none'
          stats[status] = (stats[status] || 0) + 1
        })

        return stats
      } catch (err) {
        console.error(`getStats(${eco}):`, err)
        return { total: 0 }
      }
    }
  }
}

/**
 * Cria uma base de gamificacao para um eco
 * @param {string} eco - Nome do eco
 * @param {Object} gamificationConfig - { currency, levels, badges, actions }
 * @returns {Object} Funcoes de gamificacao
 */
export function createGamificacaoBase(eco, gamificationConfig) {
  const config = ECO_PLANS[eco]
  if (!config) throw new Error(`Eco "${eco}" nao encontrado`)

  const currencyColumn = `${gamificationConfig.currency.name.toLowerCase()}_total`

  return {
    config: gamificationConfig,

    getCurrentLevel(total) {
      const levels = gamificationConfig.levels
      let currentLevel = levels[0]
      for (const level of levels) {
        if (total >= level.threshold) {
          currentLevel = level
        }
      }
      return currentLevel
    },

    getNextLevel(total) {
      const levels = gamificationConfig.levels
      for (const level of levels) {
        if (total < level.threshold) return level
      }
      return null
    },

    getProgress(total) {
      const current = this.getCurrentLevel(total)
      const next = this.getNextLevel(total)
      if (!next) return 100
      const range = next.threshold - current.threshold
      const progress = total - current.threshold
      return Math.min(100, Math.round((progress / range) * 100))
    },

    async addPoints(userId, action, customPoints) {
      const points = customPoints || gamificationConfig.actions[action] || 0
      if (points === 0) return 0

      try {
        const { data: client } = await supabase
          .from(config.table)
          .select(currencyColumn)
          .eq('user_id', userId)
          .maybeSingle()

        const currentTotal = client?.[currencyColumn] || 0
        const newTotal = currentTotal + points

        await supabase
          .from(config.table)
          .update({ [currencyColumn]: newTotal })
          .eq('user_id', userId)

        return newTotal
      } catch (err) {
        console.error(`addPoints(${eco}):`, err)
        return 0
      }
    },

    checkBadges(userData) {
      return gamificationConfig.badges.map(badge => ({
        ...badge,
        unlocked: badge.condition(userData)
      }))
    }
  }
}

/**
 * Cria configuracao base para o coach IA de um eco
 * @param {string} eco - Nome do eco
 * @param {Object} personality - Personalidade do coach
 * @returns {Object} Configuracao para o componente AICoach
 */
export function createChatBase(eco, personality) {
  return {
    eco,
    table: `${eco}_chat_messages`,
    personality: {
      name: personality.name,
      greeting: personality.greeting,
      tone: personality.tone,
      quickPrompts: personality.quickPrompts || [],
      responses: personality.responses || {},
      keywords: personality.keywords || {},
      genericResponses: personality.genericResponses || [],
      forbiddenPhrases: personality.forbiddenPhrases || []
    }
  }
}

/**
 * Helper: criar registo de cliente para um eco (se nao existir)
 */
export async function ensureEcoClient(eco, userId) {
  const config = ECO_PLANS[eco]
  if (!config) return null

  try {
    const { data: existing } = await supabase
      .from(config.table)
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) return existing

    const { data, error } = await supabase
      .from(config.table)
      .insert({ user_id: userId })
      .select()
      .maybeSingle()

    if (error) console.error(`ensureEcoClient(${eco}):`, error)
    return data
  } catch (err) {
    console.error(`ensureEcoClient(${eco}):`, err)
    return null
  }
}
