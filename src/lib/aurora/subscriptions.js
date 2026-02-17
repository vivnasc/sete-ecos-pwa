/**
 * AURORA — Lógica de acesso
 * Aurora é GRATUITA — desbloqueia automaticamente quando o utilizador
 * completa todos os outros 7 ecos (Vitalis, Áurea, Serena, Ignis, Ventis, Ecoa, Imago).
 * Não é um pacote de venda.
 */

import { SUBSCRIPTION_STATUS, ECO_PLANS } from '../shared/subscriptionPlans'
import { supabase } from '../supabase'
import { isCoach } from '../coach'

export { SUBSCRIPTION_STATUS }

export const AURORA_CONFIG = {
  TABLE: 'aurora_clients',
  ECOS_REQUIRED: 7,  // Todos os 7 ecos (Vitalis, Áurea, Serena, Ignis, Ventis, Ecoa, Imago)
  REQUIRED_ECOS: ['vitalis', 'aurea', 'serena', 'ignis', 'ventis', 'ecoa', 'imago']
}

/**
 * Verifica quantos ecos o utilizador completou (tem subscrição activa/tester)
 */
export const countCompletedEcos = async (userId) => {
  const completed = []

  for (const eco of AURORA_CONFIG.REQUIRED_ECOS) {
    const config = ECO_PLANS[eco]
    if (!config) continue

    try {
      const { data } = await supabase
        .from(config.table)
        .select('subscription_status')
        .eq('user_id', userId)
        .maybeSingle()

      if (data && ['active', 'tester'].includes(data.subscription_status)) {
        completed.push(eco)
      }
    } catch {
      // Eco não acessível, continua
    }
  }

  return { completed, count: completed.length, total: AURORA_CONFIG.ECOS_REQUIRED }
}

/**
 * Verifica se utilizador tem acesso à Aurora (gratuita ao completar todos os ecos)
 */
export const checkAuroraAccess = async (userId) => {
  try {
    // Verificar se já tem registo na aurora_clients com status tester
    const { data: client } = await supabase
      .from(AURORA_CONFIG.TABLE)
      .select('subscription_status')
      .eq('user_id', userId)
      .maybeSingle()

    if (client?.subscription_status === 'tester') {
      return { hasAccess: true, status: 'tester', reason: 'tester' }
    }

    // Verificar quantos ecos completou
    const { completed, count } = await countCompletedEcos(userId)

    if (count >= AURORA_CONFIG.ECOS_REQUIRED) {
      // Activar Aurora automaticamente
      await supabase
        .from(AURORA_CONFIG.TABLE)
        .upsert({
          user_id: userId,
          subscription_status: 'active',
          status: 'activo',
          ecos_completados: completed
        }, { onConflict: 'user_id' })

      return {
        hasAccess: true,
        status: 'active',
        reason: 'all_ecos_completed',
        ecosCompleted: completed
      }
    }

    return {
      hasAccess: false,
      status: null,
      reason: 'ecos_incomplete',
      ecosCompleted: completed,
      ecosRemaining: AURORA_CONFIG.REQUIRED_ECOS.filter(e => !completed.includes(e)),
      count,
      total: AURORA_CONFIG.ECOS_REQUIRED
    }
  } catch (error) {
    console.error('checkAuroraAccess:', error)
    return { hasAccess: false, status: null, reason: 'error' }
  }
}
