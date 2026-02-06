/**
 * SETE ECOS - Sistema de Subscricoes
 *
 * Suporta:
 * - Testers gratuitos (definidos manualmente)
 * - Trial period (X dias gratis)
 * - Pagamento manual (PayPal, M-Pesa, transferencia)
 * - Futuramente: PayPal API, M-Pesa API
 */

import { supabase } from './supabase';

// Status possiveis de subscricao
export const SUBSCRIPTION_STATUS = {
  TESTER: 'tester',           // Acesso gratuito permanente (tu defines)
  TRIAL: 'trial',             // Periodo experimental
  ACTIVE: 'active',           // Pagamento confirmado
  PENDING: 'pending',         // Aguarda confirmacao de pagamento
  EXPIRED: 'expired',         // Trial ou subscricao expirou
  CANCELLED: 'cancelled',     // Cancelado
  NONE: null                  // Sem subscricao
};

// Planos de subscricao
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Mensal',
    duration: 1, // meses
    price_mzn: 2500,
    price_usd: 38,
    discount: 0
  },
  SEMESTRAL: {
    id: 'semestral',
    name: 'Semestral',
    duration: 6, // meses
    price_mzn: 12500,
    price_usd: 190,
    discount: 17,
    savings_mzn: 2500, // economia vs mensal
    savings_usd: 38
  },
  ANNUAL: {
    id: 'annual',
    name: 'Anual',
    duration: 12, // meses
    price_mzn: 21000,
    price_usd: 320,
    discount: 30,
    savings_mzn: 9000, // economia vs mensal
    savings_usd: 136
  },
  TEST: {
    id: 'test',
    name: 'Teste PayPal',
    duration: 1, // 1 mês para teste
    price_mzn: 65,
    price_usd: 1,
    discount: 97,
    hidden: true // Só aparece com código especial
  }
};

// Configuracoes gerais
export const SUBSCRIPTION_CONFIG = {
  TRIAL_DAYS: 0,              // Sem trial - o plano personalizado JA e o valor
  DEFAULT_PLAN: 'monthly',
  CURRENCY_MZN: 'MZN',
  CURRENCY_USD: 'USD',
  // PayPal
  PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || null,
  PAYPAL_MODE: import.meta.env.VITE_PAYPAL_MODE || 'sandbox', // 'sandbox' ou 'live'
};

/**
 * Verifica se um utilizador tem acesso ao Vitalis
 */
export const checkVitalisAccess = async (userId) => {
  try {
    const { data: client, error } = await supabase
      .from('vitalis_clients')
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
          await updateSubscriptionStatus(userId, SUBSCRIPTION_STATUS.EXPIRED);
          return { hasAccess: false, status: SUBSCRIPTION_STATUS.EXPIRED, reason: 'expired' };
        }
      }
      return { hasAccess: true, status, reason: 'active' };
    }

    // Trial
    if (status === SUBSCRIPTION_STATUS.TRIAL) {
      const trialStarted = new Date(client.trial_started);
      const trialEnds = new Date(trialStarted.getTime() + SUBSCRIPTION_CONFIG.TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now < trialEnds) {
        const daysLeft = Math.ceil((trialEnds - now) / (24 * 60 * 60 * 1000));
        return { hasAccess: true, status, reason: 'trial', daysLeft, expiresAt: trialEnds };
      } else {
        // Trial expirou
        await updateSubscriptionStatus(userId, SUBSCRIPTION_STATUS.EXPIRED);
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
    console.error('Erro ao verificar acesso:', error);
    return { hasAccess: false, status: SUBSCRIPTION_STATUS.NONE, reason: 'error' };
  }
};

/**
 * Atualiza o status de subscricao
 */
export const updateSubscriptionStatus = async (userId, newStatus, options = {}) => {
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
      .from('vitalis_clients')
      .update(updateData)
      .eq('user_id', userId);

    if (error) throw error;

    // Log da alteracao
    await logSubscriptionChange(userId, newStatus, options);

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar subscricao:', error);
    return { success: false, error };
  }
};

/**
 * Inicia trial para um utilizador
 */
export const startTrial = async (userId) => {
  try {
    // Verificar se já existe registo
    const { data: existingClient } = await supabase
      .from('vitalis_clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const trialData = {
      subscription_status: SUBSCRIPTION_STATUS.TRIAL,
      trial_started: new Date().toISOString(),
      subscription_updated: new Date().toISOString()
    };

    if (existingClient) {
      // Atualizar registo existente
      const { error } = await supabase
        .from('vitalis_clients')
        .update(trialData)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      // Criar novo registo
      const { error } = await supabase
        .from('vitalis_clients')
        .insert({
          user_id: userId,
          ...trialData,
          status: 'novo',
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    }

    await logSubscriptionChange(userId, SUBSCRIPTION_STATUS.TRIAL, { action: 'trial_started' });

    return { success: true, trialDays: SUBSCRIPTION_CONFIG.TRIAL_DAYS };
  } catch (error) {
    console.error('Erro ao iniciar trial:', error);
    return { success: false, error };
  }
};

/**
 * Marca utilizador como tester (acesso gratuito)
 */
export const setAsTester = async (userId, notes = '') => {
  try {
    // Verificar se já existe registo
    const { data: existingClient } = await supabase
      .from('vitalis_clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const testerData = {
      subscription_status: SUBSCRIPTION_STATUS.TESTER,
      subscription_updated: new Date().toISOString()
    };

    if (existingClient) {
      // Atualizar registo existente
      const { error } = await supabase
        .from('vitalis_clients')
        .update(testerData)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      // Criar novo registo
      const { error } = await supabase
        .from('vitalis_clients')
        .insert({
          user_id: userId,
          ...testerData,
          status: 'novo',
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    }

    await logSubscriptionChange(userId, SUBSCRIPTION_STATUS.TESTER, { action: 'set_as_tester', notes });

    return { success: true };
  } catch (error) {
    console.error('Erro ao definir tester:', error);
    return { success: false, error };
  }
};

/**
 * Confirma pagamento manual (para coach confirmar no dashboard)
 * @param {string} userId - ID do utilizador
 * @param {object} paymentDetails - { method, reference, amount, planId }
 */
export const confirmManualPayment = async (userId, paymentDetails) => {
  try {
    // Determinar duracao baseado no plano
    const plan = SUBSCRIPTION_PLANS[paymentDetails.planId?.toUpperCase()] || SUBSCRIPTION_PLANS.MONTHLY;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + plan.duration);

    const { error } = await supabase
      .from('vitalis_clients')
      .update({
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
        subscription_expires: expiresAt.toISOString(),
        subscription_plan: plan.id,
        payment_method: paymentDetails.method,
        payment_reference: paymentDetails.reference,
        payment_amount: paymentDetails.amount,
        payment_currency: paymentDetails.currency || 'MZN',
        subscription_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    await logSubscriptionChange(userId, SUBSCRIPTION_STATUS.ACTIVE, {
      action: 'payment_confirmed',
      plan: plan.id,
      duration: plan.duration,
      ...paymentDetails
    });

    return { success: true, expiresAt, plan };
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return { success: false, error };
  }
};

/**
 * Ativa subscricao automaticamente (para pagamentos automaticos PayPal, etc)
 * @param {string} userId - ID do utilizador
 * @param {object} paymentDetails - { method, transactionId, amount, currency, planId, payerEmail }
 */
export const activateSubscription = async (userId, paymentDetails) => {
  try {
    const plan = SUBSCRIPTION_PLANS[paymentDetails.planId?.toUpperCase()] || SUBSCRIPTION_PLANS.MONTHLY;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + plan.duration);

    // Verificar se ja existe um registo vitalis_clients
    const { data: existingClient } = await supabase
      .from('vitalis_clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const subscriptionData = {
      subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
      subscription_expires: expiresAt.toISOString(),
      subscription_plan: plan.id,
      payment_method: paymentDetails.method,
      payment_reference: paymentDetails.transactionId,
      payment_amount: paymentDetails.amount,
      payment_currency: paymentDetails.currency || 'USD',
      payer_email: paymentDetails.payerEmail,
      subscription_updated: new Date().toISOString()
    };

    if (existingClient) {
      const { error } = await supabase
        .from('vitalis_clients')
        .update(subscriptionData)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('vitalis_clients')
        .insert({
          user_id: userId,
          ...subscriptionData,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    }

    await logSubscriptionChange(userId, SUBSCRIPTION_STATUS.ACTIVE, {
      action: 'payment_automatic',
      plan: plan.id,
      duration: plan.duration,
      ...paymentDetails
    });

    // Criar alerta informativo para a coach (ignore errors - constraint may not allow this tipo_alerta)
    try {
      await supabase.from('vitalis_alerts').insert({
        user_id: userId,
        tipo_alerta: 'novo_pagamento',
        descricao: `Pagamento automatico confirmado via ${paymentDetails.method} - Plano: ${plan.name} ($${paymentDetails.amount})`,
        prioridade: 'baixa',
        status: 'pendente'
      });
    } catch (alertError) {
      console.warn('Alert insert failed (non-blocking):', alertError);
    }

    return { success: true, expiresAt, plan };
  } catch (error) {
    console.error('Erro ao ativar subscricao:', error);
    return { success: false, error };
  }
};

/**
 * Regista pedido de pagamento pendente
 * @param {string} userId - ID do utilizador
 * @param {object} paymentDetails - { method, reference, amount, currency, planId }
 */
export const registerPendingPayment = async (userId, paymentDetails) => {
  try {
    const plan = SUBSCRIPTION_PLANS[paymentDetails.planId?.toUpperCase()] || SUBSCRIPTION_PLANS.MONTHLY;

    // Primeiro, verificar se ja existe um registo vitalis_clients
    const { data: existingClient } = await supabase
      .from('vitalis_clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingClient) {
      // Atualizar registo existente
      const { error } = await supabase
        .from('vitalis_clients')
        .update({
          subscription_status: SUBSCRIPTION_STATUS.PENDING,
          subscription_plan: plan.id,
          payment_method: paymentDetails.method,
          payment_reference: paymentDetails.reference,
          payment_amount: paymentDetails.amount,
          payment_currency: paymentDetails.currency || 'MZN',
          subscription_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Criar novo registo com pagamento pendente
      const { error } = await supabase
        .from('vitalis_clients')
        .insert({
          user_id: userId,
          subscription_status: SUBSCRIPTION_STATUS.PENDING,
          subscription_plan: plan.id,
          payment_method: paymentDetails.method,
          payment_reference: paymentDetails.reference,
          payment_amount: paymentDetails.amount,
          payment_currency: paymentDetails.currency || 'MZN',
          subscription_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    // Criar alerta para a coach (ignore errors - constraint may not allow this tipo_alerta)
    try {
      await supabase.from('vitalis_alerts').insert({
        user_id: userId,
        tipo_alerta: 'novo_pagamento',
        descricao: `Pagamento pendente via ${paymentDetails.method} - Plano: ${plan.name} (${paymentDetails.amount} ${paymentDetails.currency || 'MZN'})`,
        prioridade: 'alta',
        status: 'pendente'
      });
    } catch (alertError) {
      console.warn('Alert insert failed (non-blocking):', alertError);
    }

    return { success: true, plan };
  } catch (error) {
    console.error('Erro ao registar pagamento pendente:', error);
    return { success: false, error };
  }
};

/**
 * Log de alteracoes de subscricao
 */
const logSubscriptionChange = async (userId, newStatus, details = {}) => {
  try {
    await supabase.from('vitalis_subscription_log').insert({
      user_id: userId,
      new_status: newStatus,
      details: JSON.stringify(details),
      created_at: new Date().toISOString()
    });
  } catch (error) {
    // Log silencioso - nao bloquear operacao principal
    console.warn('Erro ao registar log de subscricao:', error);
  }
};

/**
 * Gera codigo de convite
 */
export const generateInviteCode = async (type = 'tester', maxUses = 1, notes = '') => {
  const code = `VITALIS-${type.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  try {
    const { error } = await supabase.from('vitalis_invite_codes').insert({
      code,
      type, // 'tester', 'trial', 'discount'
      max_uses: maxUses,
      uses_count: 0,
      notes,
      active: true,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    return { success: true, code };
  } catch (error) {
    console.error('Erro ao gerar codigo:', error);
    return { success: false, error };
  }
};

/**
 * Usa codigo de convite
 */
export const useInviteCode = async (userId, code) => {
  try {
    // Buscar codigo
    const { data: invite, error: fetchError } = await supabase
      .from('vitalis_invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (fetchError || !invite) {
      return { success: false, error: 'Codigo invalido ou expirado' };
    }

    // Verificar expiração do código
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { success: false, error: 'Codigo expirado' };
    }

    if (invite.uses_count >= invite.max_uses) {
      return { success: false, error: 'Codigo ja foi usado o maximo de vezes' };
    }

    // Aplicar beneficio - VERIFICAR SE TEVE SUCESSO
    let benefitResult = { success: false };

    if (invite.type === 'tester') {
      benefitResult = await setAsTester(userId, `Codigo: ${code}`);
    } else if (invite.type === 'trial') {
      benefitResult = await startTrial(userId);
    }

    // Se falhou ao aplicar o benefício, retornar erro
    if (!benefitResult.success) {
      console.error('Erro ao aplicar beneficio do codigo:', benefitResult.error);
      return { success: false, error: 'Erro ao aplicar beneficio. Tenta novamente.' };
    }

    // Incrementar uso
    await supabase
      .from('vitalis_invite_codes')
      .update({ uses_count: invite.uses_count + 1 })
      .eq('id', invite.id);

    // Registar quem usou
    await supabase.from('vitalis_invite_uses').insert({
      code_id: invite.id,
      user_id: userId,
      used_at: new Date().toISOString()
    });

    return { success: true, type: invite.type };
  } catch (error) {
    console.error('Erro ao usar codigo:', error);
    return { success: false, error: 'Erro ao processar codigo' };
  }
};

/**
 * Obtem estatisticas de subscricoes
 */
export const getSubscriptionStats = async () => {
  try {
    const { data: clients } = await supabase
      .from('vitalis_clients')
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
    console.error('Erro ao obter stats:', error);
    return null;
  }
};
