/**
 * ÁUREA - Sistema de Subscricoes
 *
 * Suporta:
 * - Testers gratuitos (definidos manualmente)
 * - Trial period (7 dias gratis - acesso completo)
 * - Pagamento manual (PayPal, M-Pesa, transferencia)
 */

import { supabase } from '../supabase';

// Status possiveis de subscricao
export const SUBSCRIPTION_STATUS = {
  TESTER: 'tester',           // Acesso gratuito permanente
  TRIAL: 'trial',             // Periodo experimental (7 dias)
  ACTIVE: 'active',           // Pagamento confirmado
  PENDING: 'pending',         // Aguarda confirmacao de pagamento
  EXPIRED: 'expired',         // Trial ou subscricao expirou
  CANCELLED: 'cancelled',     // Cancelado
  NONE: null                  // Sem subscricao
};

// Planos de subscricao ÁUREA
export const AUREA_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Mensal',
    duration: 1, // meses
    price_mzn: 975,
    price_usd: 15,
    discount: 0
  },
  SEMESTRAL: {
    id: 'semestral',
    name: 'Semestral',
    duration: 6, // meses
    price_mzn: 5265,
    price_usd: 81,
    discount: 10,
    savings_mzn: 585,
    savings_usd: 9
  },
  ANNUAL: {
    id: 'annual',
    name: 'Anual',
    duration: 12, // meses
    price_mzn: 9945,
    price_usd: 153,
    discount: 15,
    savings_mzn: 1755,
    savings_usd: 27
  }
};

// Configuracoes gerais
export const AUREA_CONFIG = {
  TRIAL_DAYS: 7,              // 7 dias de trial gratis
  DEFAULT_PLAN: 'monthly',
  CURRENCY_MZN: 'MZN',
  CURRENCY_USD: 'USD',
  PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || null,
  PAYPAL_MODE: import.meta.env.VITE_PAYPAL_MODE || 'sandbox',
};

/**
 * Verifica se um utilizador tem acesso ao ÁUREA
 */
export const checkAureaAccess = async (userId) => {
  try {
    const { data: client, error } = await supabase
      .from('aurea_clients')
      .select('subscription_status, subscription_expires, trial_started')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !client) {
      return { hasAccess: false, status: SUBSCRIPTION_STATUS.NONE, reason: 'no_client' };
    }

    const status = client.subscription_status;

    // Testers tem acesso permanente
    if (status === SUBSCRIPTION_STATUS.TESTER) {
      return { hasAccess: true, status, reason: 'tester' };
    }

    // Subscricao ativa
    if (status === SUBSCRIPTION_STATUS.ACTIVE) {
      // Verificar se nao expirou
      if (client.subscription_expires) {
        const expires = new Date(client.subscription_expires);
        if (expires > new Date()) {
          return { hasAccess: true, status, reason: 'active', expiresAt: expires };
        } else {
          // Expirou - atualizar status
          await updateAureaSubscriptionStatus(userId, SUBSCRIPTION_STATUS.EXPIRED);
          return { hasAccess: false, status: SUBSCRIPTION_STATUS.EXPIRED, reason: 'expired' };
        }
      }
      return { hasAccess: true, status, reason: 'active' };
    }

    // Trial
    if (status === SUBSCRIPTION_STATUS.TRIAL) {
      const trialStarted = new Date(client.trial_started);
      const trialEnds = new Date(trialStarted.getTime() + AUREA_CONFIG.TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now < trialEnds) {
        const daysLeft = Math.ceil((trialEnds - now) / (24 * 60 * 60 * 1000));
        return { hasAccess: true, status, reason: 'trial', daysLeft, expiresAt: trialEnds };
      } else {
        // Trial expirou
        await updateAureaSubscriptionStatus(userId, SUBSCRIPTION_STATUS.EXPIRED);
        return { hasAccess: false, status: SUBSCRIPTION_STATUS.EXPIRED, reason: 'trial_expired' };
      }
    }

    // Pagamento pendente - permitir acesso temporario
    if (status === SUBSCRIPTION_STATUS.PENDING) {
      return { hasAccess: true, status, reason: 'pending_payment' };
    }

    // Sem acesso
    return { hasAccess: false, status: status || SUBSCRIPTION_STATUS.NONE, reason: 'no_subscription' };

  } catch (error) {
    console.error('Erro ao verificar acesso ÁUREA:', error);
    return { hasAccess: false, status: SUBSCRIPTION_STATUS.NONE, reason: 'error' };
  }
};

/**
 * Atualiza o status de subscricao
 */
export const updateAureaSubscriptionStatus = async (userId, newStatus, options = {}) => {
  try {
    const updateData = {
      subscription_status: newStatus,
      subscription_updated: new Date().toISOString()
    };

    if (options.expiresAt) {
      updateData.subscription_expires = options.expiresAt;
    }

    if (options.paymentMethod) {
      updateData.payment_method = options.paymentMethod;
    }

    if (options.paymentRef) {
      updateData.payment_reference = options.paymentRef;
    }

    const { error } = await supabase
      .from('aurea_clients')
      .update(updateData)
      .eq('user_id', userId);

    if (error) throw error;

    // Log da alteracao
    await logAureaSubscriptionChange(userId, newStatus, options);

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar subscricao ÁUREA:', error);
    return { success: false, error };
  }
};

/**
 * Inicia trial para um utilizador (7 dias gratuitos)
 */
export const startAureaTrial = async (userId) => {
  try {
    // Verificar se ja existe cliente
    const { data: existingClient } = await supabase
      .from('aurea_clients')
      .select('id, trial_started')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingClient?.trial_started) {
      return { success: false, error: 'Trial ja utilizado anteriormente' };
    }

    const trialData = {
      subscription_status: SUBSCRIPTION_STATUS.TRIAL,
      trial_started: new Date().toISOString(),
      subscription_updated: new Date().toISOString()
    };

    if (existingClient) {
      const { error } = await supabase
        .from('aurea_clients')
        .update(trialData)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('aurea_clients')
        .insert({
          user_id: userId,
          ...trialData,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    }

    await logAureaSubscriptionChange(userId, SUBSCRIPTION_STATUS.TRIAL, { action: 'trial_started' });

    return { success: true, trialDays: AUREA_CONFIG.TRIAL_DAYS };
  } catch (error) {
    console.error('Erro ao iniciar trial ÁUREA:', error);
    return { success: false, error };
  }
};

/**
 * Marca utilizador como tester (acesso gratuito)
 */
export const setAureaTester = async (userId, notes = '') => {
  try {
    const { data: existingClient } = await supabase
      .from('aurea_clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const testerData = {
      subscription_status: SUBSCRIPTION_STATUS.TESTER,
      subscription_updated: new Date().toISOString()
    };

    if (existingClient) {
      const { error } = await supabase
        .from('aurea_clients')
        .update(testerData)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('aurea_clients')
        .insert({
          user_id: userId,
          ...testerData,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    }

    await logAureaSubscriptionChange(userId, SUBSCRIPTION_STATUS.TESTER, { action: 'set_as_tester', notes });

    return { success: true };
  } catch (error) {
    console.error('Erro ao definir tester ÁUREA:', error);
    return { success: false, error };
  }
};

/**
 * Confirma pagamento manual
 */
export const confirmAureaPayment = async (userId, paymentDetails) => {
  try {
    const plan = AUREA_PLANS[paymentDetails.planId?.toUpperCase()] || AUREA_PLANS.MONTHLY;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + plan.duration);

    const { data: existingClient } = await supabase
      .from('aurea_clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const subscriptionData = {
      subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
      subscription_expires: expiresAt.toISOString(),
      subscription_plan: plan.id,
      payment_method: paymentDetails.method,
      payment_reference: paymentDetails.reference || paymentDetails.transactionId,
      payment_amount: paymentDetails.amount,
      payment_currency: paymentDetails.currency || 'MZN',
      payer_email: paymentDetails.payerEmail,
      subscription_updated: new Date().toISOString()
    };

    if (existingClient) {
      const { error } = await supabase
        .from('aurea_clients')
        .update(subscriptionData)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('aurea_clients')
        .insert({
          user_id: userId,
          ...subscriptionData,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    }

    await logAureaSubscriptionChange(userId, SUBSCRIPTION_STATUS.ACTIVE, {
      action: 'payment_confirmed',
      plan: plan.id,
      duration: plan.duration,
      ...paymentDetails
    });

    return { success: true, expiresAt, plan };
  } catch (error) {
    console.error('Erro ao confirmar pagamento ÁUREA:', error);
    return { success: false, error };
  }
};

/**
 * Regista pedido de pagamento pendente
 */
export const registerAureaPendingPayment = async (userId, paymentDetails) => {
  try {
    const plan = AUREA_PLANS[paymentDetails.planId?.toUpperCase()] || AUREA_PLANS.MONTHLY;

    const { data: existingClient } = await supabase
      .from('aurea_clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const pendingData = {
      subscription_status: SUBSCRIPTION_STATUS.PENDING,
      subscription_plan: plan.id,
      payment_method: paymentDetails.method,
      payment_reference: paymentDetails.reference,
      payment_amount: paymentDetails.amount,
      payment_currency: paymentDetails.currency || 'MZN',
      subscription_updated: new Date().toISOString()
    };

    if (existingClient) {
      const { error } = await supabase
        .from('aurea_clients')
        .update(pendingData)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('aurea_clients')
        .insert({
          user_id: userId,
          ...pendingData,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    }

    return { success: true, plan };
  } catch (error) {
    console.error('Erro ao registar pagamento pendente ÁUREA:', error);
    return { success: false, error };
  }
};

/**
 * Log de alteracoes de subscricao
 */
const logAureaSubscriptionChange = async (userId, newStatus, details = {}) => {
  try {
    await supabase.from('aurea_subscription_log').insert({
      user_id: userId,
      new_status: newStatus,
      details: JSON.stringify(details),
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Erro ao registar log de subscricao ÁUREA:', error);
  }
};

/**
 * Obtem estatisticas de subscricoes ÁUREA
 */
export const getAureaSubscriptionStats = async () => {
  try {
    const { data: clients } = await supabase
      .from('aurea_clients')
      .select('subscription_status');

    const stats = {
      total: clients?.length || 0,
      testers: 0,
      trial: 0,
      active: 0,
      pending: 0,
      expired: 0,
      none: 0
    };

    clients?.forEach(c => {
      const status = c.subscription_status || 'none';
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      } else {
        stats.none++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Erro ao obter stats ÁUREA:', error);
    return null;
  }
};
