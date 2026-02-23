/**
 * SETE ECOS — Payment Flow Reutilizavel
 *
 * Fluxo de pagamento generico que suporta PayPal e M-Pesa
 * para qualquer eco. Usado pelo PaymentPage.jsx partilhado.
 */

import { supabase } from '../supabase'
import { ECO_PLANS, SUBSCRIPTION_STATUS, GLOBAL_CONFIG } from './subscriptionPlans'

/**
 * Obter configuracao de pagamento para um eco
 * @param {string} eco - Nome do eco
 * @returns {Object} Configuracao de pagamento
 */
export function getPaymentConfig(eco) {
  const config = ECO_PLANS[eco]
  if (!config) return null

  return {
    eco,
    name: config.name,
    color: config.color,
    colorDark: config.colorDark,
    plans: [config.monthly, config.semestral, config.annual],
    paypal: {
      clientId: GLOBAL_CONFIG.PAYPAL_CLIENT_ID,
      mode: GLOBAL_CONFIG.PAYPAL_MODE,
      enabled: !!GLOBAL_CONFIG.PAYPAL_CLIENT_ID
    },
    mpesa: {
      enabled: true,
      whatsapp: GLOBAL_CONFIG.WHATSAPP_COACH
    },
    trial: {
      days: GLOBAL_CONFIG.TRIAL_DAYS,
      enabled: true
    }
  }
}

/**
 * Iniciar trial gratuito
 */
export async function startTrial(eco, userId) {
  const config = ECO_PLANS[eco]
  if (!config) return { success: false, error: 'Eco nao encontrado' }

  try {
    // Verificar se ja usou trial
    const { data: existing } = await supabase
      .from(config.table)
      .select('trial_started')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing?.trial_started) {
      return { success: false, error: 'Trial ja utilizado' }
    }

    const { error } = await supabase
      .from(config.table)
      .upsert({
        user_id: userId,
        subscription_status: SUBSCRIPTION_STATUS.TRIAL,
        trial_started: new Date().toISOString(),
        subscription_updated: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (error) return { success: false, error: error.message }

    return { success: true, daysLeft: GLOBAL_CONFIG.TRIAL_DAYS }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Registar pagamento pendente (M-Pesa ou transferencia)
 */
export async function registerPendingPayment(eco, userId, details) {
  const config = ECO_PLANS[eco]
  if (!config) return { success: false, error: 'Eco nao encontrado' }

  const plan = config[details.planKey] || config.monthly

  try {
    const { error } = await supabase
      .from(config.table)
      .upsert({
        user_id: userId,
        subscription_status: SUBSCRIPTION_STATUS.PENDING,
        subscription_plan: details.planKey,
        payment_method: details.method || 'mpesa',
        payment_reference: details.reference,
        payment_amount: plan.price_mzn,
        subscription_updated: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (error) return { success: false, error: error.message }

    // Notificar coach via alerta
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('nome, email')
        .eq('id', userId)
        .maybeSingle()

      if (userData) {
        await supabase.from('vitalis_alerts').insert({
          tipo_alerta: 'novo_pagamento',
          mensagem: `[${config.name}] Novo pagamento pendente de ${userData.nome || userData.email}: ${plan.price_mzn} MZN via ${details.method}. Ref: ${details.reference}`,
          dados: {
            eco,
            userId,
            plan: details.planKey,
            method: details.method,
            reference: details.reference,
            amount: plan.price_mzn
          }
        })
      }
    } catch (alertErr) {
      console.error('Erro ao criar alerta:', alertErr)
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Confirmar pagamento PayPal (callback automatico)
 */
export async function confirmPayPalPayment(eco, userId, paypalDetails) {
  const config = ECO_PLANS[eco]
  if (!config) return { success: false, error: 'Eco nao encontrado' }

  const plan = config[paypalDetails.planKey] || config.monthly
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + plan.duration)

  try {
    const { error } = await supabase
      .from(config.table)
      .upsert({
        user_id: userId,
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
        subscription_expires: expiresAt.toISOString(),
        subscription_plan: paypalDetails.planKey,
        payment_method: 'paypal',
        payment_reference: paypalDetails.orderId,
        payment_amount: plan.price_usd,
        payer_email: paypalDetails.payerEmail,
        subscription_updated: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (error) return { success: false, error: error.message }

    return { success: true, expiresAt }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Gerar mensagem WhatsApp para pagamento M-Pesa
 */
export function getMpesaWhatsappLink(eco, planKey, reference) {
  const config = ECO_PLANS[eco]
  if (!config) return '#'

  const plan = config[planKey] || config.monthly
  const msg = encodeURIComponent(
    `Olá! Fiz o pagamento para o ${config.name}.\n` +
    `Plano: ${plan.name}\n` +
    `Valor: ${plan.price_mzn.toLocaleString()} MZN\n` +
    `Referência M-Pesa: ${reference}\n` +
    `Por favor, confirme a minha subscrição.`
  )
  return `https://wa.me/${GLOBAL_CONFIG.WHATSAPP_COACH}?text=${msg}`
}
