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

// Configuracoes
export const SUBSCRIPTION_CONFIG = {
  TRIAL_DAYS: 14,             // Dias de trial gratuito
  PRICE_MZN: 1500,            // Preco em Meticais
  PRICE_USD: 25,              // Preco em USD (PayPal)
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
      .single();

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
    const { error } = await supabase
      .from('vitalis_clients')
      .update({
        subscription_status: SUBSCRIPTION_STATUS.TRIAL,
        trial_started: new Date().toISOString(),
        subscription_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

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
    const { error } = await supabase
      .from('vitalis_clients')
      .update({
        subscription_status: SUBSCRIPTION_STATUS.TESTER,
        subscription_notes: notes,
        subscription_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    await logSubscriptionChange(userId, SUBSCRIPTION_STATUS.TESTER, { action: 'set_as_tester', notes });

    return { success: true };
  } catch (error) {
    console.error('Erro ao definir tester:', error);
    return { success: false, error };
  }
};

/**
 * Confirma pagamento manual (PayPal, M-Pesa, etc)
 */
export const confirmManualPayment = async (userId, paymentDetails) => {
  try {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mes de acesso

    const { error } = await supabase
      .from('vitalis_clients')
      .update({
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
        subscription_expires: expiresAt.toISOString(),
        payment_method: paymentDetails.method, // 'paypal', 'mpesa', 'transfer'
        payment_reference: paymentDetails.reference,
        payment_amount: paymentDetails.amount,
        subscription_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    await logSubscriptionChange(userId, SUBSCRIPTION_STATUS.ACTIVE, {
      action: 'payment_confirmed',
      ...paymentDetails
    });

    return { success: true, expiresAt };
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return { success: false, error };
  }
};

/**
 * Regista pedido de pagamento pendente
 */
export const registerPendingPayment = async (userId, paymentDetails) => {
  try {
    const { error } = await supabase
      .from('vitalis_clients')
      .update({
        subscription_status: SUBSCRIPTION_STATUS.PENDING,
        payment_method: paymentDetails.method,
        payment_reference: paymentDetails.reference,
        subscription_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Criar alerta para a coach
    await supabase.from('vitalis_alerts').insert({
      user_id: userId,
      tipo_alerta: 'pagamento_pendente',
      descricao: `Pagamento pendente via ${paymentDetails.method}: ${paymentDetails.reference}`,
      prioridade: 'alta',
      status: 'pendente'
    });

    return { success: true };
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
      .single();

    if (fetchError || !invite) {
      return { success: false, error: 'Codigo invalido ou expirado' };
    }

    if (invite.uses_count >= invite.max_uses) {
      return { success: false, error: 'Codigo ja foi usado o maximo de vezes' };
    }

    // Aplicar beneficio
    if (invite.type === 'tester') {
      await setAsTester(userId, `Codigo: ${code}`);
    } else if (invite.type === 'trial') {
      await startTrial(userId);
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
